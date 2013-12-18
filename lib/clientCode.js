/**
 * This module contains the code that wrap instrumented code and is sent back
 * to the client.
 *
 * It exposes the methods
 *    generate -> generate the client code wrapping it
 *    format -> return the code in the json object used by other modules
 *    shouldBeExcluded -> Whether or not the file should be excluded from instrumentation
 *    isInstrumented -> Whether the file is already instrumented or not
 */
var uglify = require("uglify-js").uglify;
var fileUtil = require("./file");

/**
 * Format the given code into a JSON object that can be exchanged with other
 * modules.
 *
 * The format is
 * {
 *    clientCode : Code to be sent to the client
 *    error : Whether there was an error interpreting the file
 * }
 *
 * @param {String} content Client code
 * @param {Boolean} error True in case of errors
 * @param {Boolean} asIs True to keep the code as it is, false to mark as instrumented
 */
exports.format = function (content, error, asIs) {
	return {
		clientCode : asIs ? content : fileUtil.markInstrumented(content),
		error : !!error
	};
};

/**
 * Whether or not the file should be excluded from instrumentation.
 * It provides a more generic interface to file module
 *
 * @param {String} location File name
 * @param {String|Array} exclude List of file to be excluded
 *
 * @return Boolean
 */
exports.shouldBeExcluded = function (location, exclude) {
	if (!exclude) {
		return false;
	} else if (typeof exclude === "string") {
		exclude = [exclude];
	}

	return !fileUtil.wanted(location, exclude);
};

/**
 * Whether the file is already instrumented or not
 *
 * @param {String} code File content
 */
exports.isInstrumented = fileUtil.isInstrumented;

/**
 * Generate the additional code sent to the client.
 * This code contains the logic to send reports back to the server.
 *
 * @param {String} file File name
 * @param {String} content File content
 * @param {Object} options Instrumentation options
 * @param {Object} structure Structure of the instrumented code
 * 
 * <pre>
 * {
 *    code : instrumented code
 *    lines : list of line ids,
 *    conditions : list of conditions ids
 *    functions : list of functions ids
 * }
 * </pre>
 */
exports.generate = function (file, content, options, structure) {
	return [
			// closure that creates the global objects
			"(", createGlobalObjects.toString(), ")(",
				// arguments for the closure call
			uglify.make_string(file), ",", JSON.stringify({
				lines: structure.lines,
				code: fileUtil.normalizeNewLines(content),
				allConditions: structure.conditions,
				allFunctions: structure.functions
			}),
		");(",
			//second closure with the logic to send the report to the server
			submitData.toString(), 
		")();\n",
		structure.code
	].join("");
};

/**
 * Create globals and populate them with some data
 * 
 * @param {String} f File name
 * @param {Object} args Object containing list of statements, conditions, ...
 */
var createGlobalObjects = function (f, args) {
	var $$_l = this.$$_l;
	if (!this.$$_l) {
		$$_l = function (file, line) {
			$$_l.runLines[file][line] += 1;
		};
		$$_c = function (file, line, condition) {
			$$_l.conditions[file].push([line, !!condition]);
			return condition;
		};
		$$_f = function (file, name, line) {
			// to have a global view, fns are not divided by file here
			$$_l.runFunctions.push([file, name, line]);
		};
		$$_l.runLines = {};
		$$_l.lines = {};
		$$_l.code = {};
		$$_l.conditions = {};
		$$_l.allConditions = {};
		$$_l.allFunctions = {};
		$$_l.runFunctions = [];

		this.$$_l = $$_l;
	}
	$$_l.lines[f] = args.lines;
	$$_l.runLines[f] = {};
	for (var i = 0, len = args.lines.length; i < len; i += 1) {
		$$_l.runLines[f][args.lines[i]] = 0;
	}
	$$_l.code[f] = args.code;
	$$_l.conditions[f] = [];
	$$_l.allConditions[f] = args.allConditions;
	$$_l.allFunctions[f] = args.allFunctions;
};


// The serialize in this function is much simplified, values are string/object/array/boolean/Number
var submitData = function () {
	var serialize = function (object) {
		var properties = [];
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				properties.push('"' + key.replace('\\', '\\\\') + '":' + getValue(object[key]));
			}
		}
		return "{" + properties.join(",") + "}";
	};
	var getValue = function (value) {
		if (typeof value === "string") {
			return quote(value);
		} else if (typeof value === "boolean") {
			return "" + value;
		} else if (value.join) {
			if (value.length == 0) {
				return "[]";
			} else {
				var flat = [];
				for (var i = 0, len = value.length; i < len; i += 1) {
					flat.push(getValue(value[i]));
				}
				return '[' + flat.join(",") + ']';
			}
		} else if (typeof value === "number") {
			return value;
		} else {
			return serialize(value);
		}
	};
	var pad = function (s) {
		return '0000'.substr(s.length) + s;
	};
	var replacer = function (c) {
		switch (c) {
			case '\b': return '\\b';
			case '\f': return '\\f';
			case '\n': return '\\n';
			case '\r': return '\\r';
			case '\t': return '\\t';
			case '"': return '\\"';
			case '\\': return '\\\\';
			default: return '\\u' + pad(c.charCodeAt(0).toString(16));
		}
	};
	var quote = function (s) {
		return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, replacer) + '"';
	};
	if (!$$_l.__send) {
		$$_l.__send = function (data) {
			var xhr = (window.ActiveXObject) ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
			xhr.open('POST', '/node-coverage-store', false);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(data);
		};
	}

	if (!$$_l.submit) {
		$$_l.submit = function (name) {
			$$_l.__send(serialize({
				name : name || "",
				lines : $$_l.lines,
				runLines : $$_l.runLines,
				code : $$_l.code,
				allConditions : $$_l.allConditions,
				conditions : $$_l.conditions,
				allFunctions : $$_l.allFunctions,
				runFunctions : $$_l.runFunctions
			}));
		};
	}
};