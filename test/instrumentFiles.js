var fileSystem = require("../lib/fileSystem");
var path = require("path");
var clientCode = require("../lib/clientCode");

function createInstrumentCallback (container) {
	return function (file, code) {
		var isJs = (path.extname(file) === ".js");

		container[file] = isJs ? {
			isJs : true,
			hasStatement : code.indexOf("$$_l(") > 0,
			hasConditions : code.indexOf("$$_c(") > 0,
			hasFunctions : code.indexOf("$$_f(") > 0,
			hasHeader : clientCode.isInstrumented(code)
		} : {
			isJs : false
		};
	};
}

exports.exclude = function (test) {
	var options = {
		exclude : [".git", "node_modules", "test/instrumentFiles.js", "views/statics"]
	};

	var instrumented = {};

	fileSystem.statFileOrFolder(["."], "", createInstrumentCallback(instrumented), options);

	var allFiles = Object.keys(instrumented);

	test.expect(Math.max(allFiles.length * 3, 20));

	allFiles.forEach(function (fileName) {
		test.equals(fileName.indexOf(".git"), -1, "Found a file in exlude folder " + fileName);
		test.equals(fileName.indexOf("node_modules"), -1, "Found a file in exlude folder " + fileName);
		test.equals(fileName.indexOf("views/statics"), -1, "Found a file in exlude folder " + fileName);

		if (fileName.indexOf("instrumentFiles") > 0) {
			test.ok(false, "instrumentFiles was included");
		}
	});

	test.done();
};

exports.ignore = function (test) {
	var options = {
		exclude : [".git", "node_modules", "views/statics"],
		ignore : ["test/code"]
	};

	var instrumented = {};

	fileSystem.statFileOrFolder(["."], "", createInstrumentCallback(instrumented), options);

	var allFiles = Object.keys(instrumented);

	test.expect(Math.max(allFiles.length * 4, 20));

	allFiles.forEach(function (fileName) {
		test.equals(fileName.indexOf(".git"), -1, "Found a file in exlude folder " + fileName);
		test.equals(fileName.indexOf("node_modules"), -1, "Found a file in exlude folder " + fileName);
		test.equals(fileName.indexOf("views/statics"), -1, "Found a file in exlude folder " + fileName);

		var wasIgnoredIfNeeded = true;
		var descriptor = instrumented[fileName];
		if (descriptor.isJs && fileName.indexOf("test/code") === 0) {
			if (!descriptor.hasHeader) {
				// no header : will be instrumented by the server
				wasIgnoredIfNeeded = false;
			}

			if (descriptor.hasStatement) {
				// has instrumentation code
				wasIgnoredIfNeeded = false;
			}
		}

		test.ok(wasIgnoredIfNeeded, "File was not ignored " + fileName);
	});

	test.done();
};