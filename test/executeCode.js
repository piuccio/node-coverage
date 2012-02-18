var helpers = require("./helpers/utils");
var fileSystem = require("../lib/fileSystem");

var expectedCoverage = require("./results/code").results;
// count the number of assert expected (for each test)
var files = Object.keys(expectedCoverage);
var asserts = Object.keys(expectedCoverage[files[0]]);
var totalAssertsPerTest = 2 * files.length * asserts.length;

function compare (file, code, options) {
	var generatedReport = helpers.executeCode(file, code);
	var shortFileName = helpers.shortName(file);

	var expected = expectedCoverage[shortFileName];
	if (options && options["condition"] === false) {
		expected.conditions = 0;
		expected.conditionsTrue = 0;
		expected.conditionsFalse = 0;
		expected.conditionsPercentage = 100;
	}
	if (options && options["function"] === false) {
		expected.functions = 0;
		expected.functionsCalled = 0;
		expected.functionsPercentage = 100;
	}

	helpers.assertCoverageEquals(generatedReport.files[file], expected, file, testObject);
	helpers.assertCoverageEquals(generatedReport.global, expected, file, testObject);

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

exports.globalMetrics = function (test) {
	test.expect(totalAssertsPerTest);

	testObject = test;
	waitingFiles = files.length;
	
	fileSystem.statFileOrFolder(["test/code/"], "", compare);
};

exports.disabledMetrics = function (test) {
	test.expect(totalAssertsPerTest);

	testObject = test;
	waitingFiles = files.length;

	var options = {
		"function" : false,
		"condition" : false
	};

	fileSystem.statFileOrFolder(["test/code/"], "", compareWithOptions(options), options);
};