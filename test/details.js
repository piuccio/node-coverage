var helpers = require("./helpers/utils");
var fileSystem = require("../lib/fileSystem");

var expectedCoverage = require("./results/details").results;
// count the number of assert expected (for each test)
var files = Object.keys(expectedCoverage);
var asserts = Object.keys(expectedCoverage[files[0]]);
var totalAssertsPerTest = 2 * files.length * asserts.length;

function compare (file, code, options) {
	var generatedReport = helpers.executeCode(file, code);
	var shortFileName = helpers.shortName(file);

	var expected = expectedCoverage[shortFileName];

	helpers.assertDetailsEquals(generatedReport.files[file], expected, file, testObject);

	waitingFiles -= 1;
	if (waitingFiles < 1) {
		testObject.done();
	}
};

function compareWithOptions (options) {
	return function (file, code) {
		compare(file, code, options);
	};
};

var testObject;
var waitingFiles;

exports.codeDetails = function (test) {
	test.expect(98);

	testObject = test;
	waitingFiles = files.length;
	
	fileSystem.statFileOrFolder(["test/code/"], "", compare);
};