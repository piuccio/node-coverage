var highlight = require("./highlight").highlight;
var uglify = require("uglify-js").uglify;

/**
 * Fist line of the generated file, it avoid instrumenting the same file twice
 */
var header = "//NODE-COVERAGE OFF\n";

function isInstrumented (code) {
	return (code.indexOf(header) === 0);
}

function generateWithHeaderOnly (code) {
	return {
		clientCode : header + code,
		error : false
	};
}

function formatContent (content) {
	return {
		clientCode : content,
		error : false
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
var composeFile = function (fileName, allLines, allConditions, allFunctions, code, options) {
	var highlighted = highlight(code);
	var clientCodeHeader = [
		// header comment saying that this file is instrumented
		header,
		// closure that creates the global objects
		"(", createGlobalObjects.toString(), ")(",
			// argument for the closure call
			uglify.make_string(fileName),
		");"
	];
	if (options.staticInfo !== false) {
		clientCodeHeader.push("(", storeStaticFileInfo.toString(), ")(", uglify.make_string(fileName), ",", JSON.stringify({
			code : highlighted,
			lines : allLines,
			conditions : allConditions,
			functions : allFunctions
		}), ");");
	}
	if (options.submit !== false) {
		clientCodeHeader.push("(",
			//second closure with the logic to send the report to the server
			submitData.toString(), ")();"
		);
	}

	return {
		clientCode : clientCodeHeader.join("") + "\n" + code,
		staticInfo: {
			code : highlighted,
			lines : allLines,
			conditions : allConditions,
			functions : allFunctions
		},
		error : false
	};
};

var createGlobalObjects = function (f) {
	var $$_l = this.$$_l;
	if (!this.$$_l) {
		$$_l = function (file, line) {
			var counter = $$_l.run[file].lines[line]++;
			if (!counter > 0) {
				$$_l.run[file].lines[line] = 1;
			}
		};
		$$_c = function (file, line, condition) {
			var counter = $$_l.run[file].conditions[line + "=" + !!condition]++;
			if (!counter > 0) {
				$$_l.run[file].conditions[line + "=" + !!condition] = 1;
			}
			return condition;
		};
		$$_f = function (file, line) {
			var counter = $$_l.run[file].functions[line]++;
			if (!counter > 0) {
				$$_l.run[file].functions[line] = 1;
			}
		};
		$$_l.run = {};
		this.$$_l = $$_l;
	}
	$$_l.run[f] = {
		lines: {},
		conditions: {},
		functions: {}
	};
};

var storeStaticFileInfo = function (f, args) {
	if (!this.$$_l.staticInfo) {
		$$_l.staticInfo = {};
	}
	$$_l.staticInfo[f] = args;
};

// The serialize in this function is much simplified, values are string/object/array/boolean/Number
var submitData = function () {
	var serialize = function (object) {
		var properties = [];
		for (var key in object) {
			if (object.hasOwnProperty(key) && object[key] != null) {
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
				staticInfo : $$_l.staticInfo,
				run : $$_l.run
			}));
		};
	}
};

exports.generate = composeFile;
exports.isInstrumented = isInstrumented;
exports.generateWithHeaderOnly = generateWithHeaderOnly;
exports.shouldBeExcluded = shouldBeExcluded;
exports.formatContent = formatContent;
