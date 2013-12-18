var helpers = require("./helpers/utils");
var fileSystem = require("../lib/fileSystem");
var report = require("../lib/report");
var instrument = require("../lib/instrument");
var fileContent = require("../lib/fileContent");
var fileLib = require("../lib/file");
var path = require("path");
var parser = require("uglify-js").parser;
var uglify = require("uglify-js").uglify;

exports.unused = function (test) {
	test.expect(9);

	var expectedCode = {};

	fileSystem.perform("test/fileSize_onlyCovered/**", function (error, file, code) {
		expectedCode[path.basename(file)] = uglify.gen_code(parser.parse(code), {beautify : false});
	}).then(function () {
		fileSystem.perform("test/fileSize/**", function (error, file, code) {
			test.ifError(error);
			code = fileLib.normalizeNewLines(code);

			var instrumented = instrument(file, code).clientCode;
			var report = helpers.executeCode(file, instrumented);

			var regeneratedCode = fileContent.getFullFile(report.files[file]);

			test.equals(code, regeneratedCode.code, "Regenerated code for " + file);

			var coveredCode = fileContent.getCoveredFile(report.files[file]).code;

			test.equals(expectedCode[path.basename(file)], coveredCode, "Covered code for " + file);
		}).then(function () {
			test.done();
		});
	});
};

exports.minify = function (test) {
	test.expect(9);

	var code = "if(true) var a=0;\nelse if(false) var b=0";
	shouldntThrow(test, code);

	var code = "if(false) var a=0;\nelse if(true) var b=0";
	shouldntThrow(test, code);

	var code = "function a () {if(true) var a=0;\nelse if(false) var b=0};a()";
	shouldntThrow(test, code);

	var code = "if(true) if (true) if (false) var b=0; else var c=0";
	shouldntThrow(test, code);

	var code = "if (true) for(var not in {}) not+=1; else var b=0";
	shouldntThrow(test, code);

	var code = "if (true) while(false) not+=1; else var b=0";
	shouldntThrow(test, code);

	var code = "function a () {if (true) for(var not in {}) not+=1; else var b=0}a()";
	shouldntThrow(test, code);

	var code = "function a () {if (true) while(false) not+=1; else var b=0}a()";
	shouldntThrow(test, code);

	var code = "function T(){return 1};var b=new Function(T);b()";
	shouldntThrow(test, code);

	test.done();
};

function shouldntThrow (test, code) {
	var instrumented = instrument("dummy.js", code).clientCode;
	var report = helpers.executeCode("dummy.js", instrumented);
	var coveredCode = fileContent.getCoveredFile(report.files["dummy.js"]);

	test.doesNotThrow(function () {
		try {
			fileContent.minify(coveredCode.tree);
		} catch (ex) {
			ex.message = "\nUnable to minify the following code:\n" + coveredCode;
			console.error(ex);
			throw ex;
		}
	});
}
