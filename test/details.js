var helpers = require("./helpers/utils");
var fileSystem = require("../lib/fileSystem");

var expectedCoverage = require("./results/details").results;
var totalAssertsPerFile = 9;

function compare (file, code) {
	var generatedReport = helpers.executeCode(file, code);
	var shortFileName = helpers.shortName(file);

	var expected = expectedCoverage.code[shortFileName] || expectedCoverage.merge[shortFileName];

	helpers.assertDetailsEquals(generatedReport.files[file], expected, file, testObject);

	waitingFiles -= 1;
	if (waitingFiles < 1) {
		testObject.done();
	}
};

var testObject;
var waitingFiles;

exports.codeDetails = function (test) {
	var files = Object.keys(expectedCoverage.code);
	test.expect(files.length * totalAssertsPerFile);

	testObject = test;
	waitingFiles = files.length;
	
	fileSystem.statFileOrFolder(["test/code/"], "", compare);
};

exports.mergeDetails = function (test) {
	var files = Object.keys(expectedCoverage.merge);
	test.expect(files.length * totalAssertsPerFile);

	testObject = test;
	waitingFiles = files.length;
	
	fileSystem.statFileOrFolder(["test/reports/"], "", compare);
};