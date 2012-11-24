var helpers = require("./helpers/utils");
var fileSystem = require("../lib/fileSystem");
var report = require("../lib/report");
var instrument = require("../lib/instrument");
var fileContent = require("../lib/fileContent");
var fileLib = require("../lib/file");
var path = require("path");

exports.unused = function (test) {
	test.expect(9);

	var expectedCode = {};

	fileSystem.perform("test/fileSize_onlyCovered/**", function (error, file, code) {
		expectedCode[path.basename(file)] = code.replace(/\n*\t*/g, "");
	}).then(function () {
		fileSystem.perform("test/fileSize/**", function (error, file, code) {
			test.ifError(error);

			var instrumented = instrument(file, code).clientCode;
			var report = helpers.executeCode(file, instrumented);

			var regeneratedCode = fileContent.getFullFile(report.files[file]);

			code = fileLib.normalizeNewLines(code);

			test.equals(code, regeneratedCode, "Regenerated code for " + file);

			var coveredCode = fileContent.getCoveredFile(report.files[file]);
			coveredCode = coveredCode.replace(/\n*\t*/g, "");

			test.equals(expectedCode[path.basename(file)], coveredCode, "Covered code for " + file);
		}).then(function () {
			test.done();
		});
	});
};