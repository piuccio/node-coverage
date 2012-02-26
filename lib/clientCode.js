var highlight = require("./highlight").highlight;

/**
 * Fist line of the generated file, it avoid instrumenting the same file twice
 */
var header = "//NODE-COVERAGE OFF\n";

function isInstrumented (code) {
	return (code.indexOf(header) === 0);
}

function generateWithHeaderOnly (code) {
	return {
		clientCode : header + code
	};
}

function shouldBeExcluded (location, exclude) {
	if (!exclude) {
		return false;
	} else if (!exclude.forEach) {
		exclude = [exclude];
	}

	var found = false;
	exclude.forEach(function (item) {
		if (location.indexOf(item) === 0) {
			found = true;
		}
	});

	return found;
}

/**
 * These functions generate the additional code sent to the client.
 * This code contains the logic to send reports back to the server
 */
var composeFile = function (fileName, allLines, allConditions, allFunctions, code, doHighlight) {
	var highlighted = highlight(code);
	return {
		clientCode : [
			// header comment saying that this file is instrumented
			header,
			// closure that creates the global objects
			"(", createGlobalObjects.toString(), ")('",
				// arguments for the closure call
				fileName, "',", JSON.stringify({
					lines : allLines,
					code : doHighlight ? highlighted : {},
					allConditions : allConditions,
					allFunctions : allFunctions
				}), ");(",
			//second closure with the logic to send the report to the server
			submitData.toString(), ")();"
		].join("") + "\n" + code,
		highlightedCode : highlighted
	};
};

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
	function serialize(object) {
		var properties = [];
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				properties.push('"' + key + '":' + getValue(object[key]));
			}
		}
		return "{" + properties.join(",") + "}";
	};
	function getValue(value) {
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
	function pad(s) {
		return '0000'.substr(s.length) + s;
	};
	function replacer(c) {
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
	function quote(s) {
		return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, replacer) + '"';
	};
	function send (data) {
		var xhr = (window.ActiveXObject) ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
		xhr.open('POST', '/node-coverage-store');
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(data);
	};

	if (!$$_l.submit) {
		$$_l.submit = function (name) {
			send(serialize({
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

exports.generate = composeFile;
exports.isInstrumented = isInstrumented;
exports.generateWithHeaderOnly = generateWithHeaderOnly;
exports.shouldBeExcluded = shouldBeExcluded;