var helpers = require("./helpers/utils");

var expectedCoverage = require("./results/code").results;
// count the number of assert expected (for each test)
var files = Object.keys(expectedCoverage);
var asserts = Object.keys(expectedCoverage[files[0]]);
var totalAssertsPerTest = 2 * files.length * asserts.length;

function compare (test, file, code, report, options) {
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

	helpers.assertCoverageEquals(report.files[file], expected, file, test);
	helpers.assertCoverageEquals(report.global, expected, file, test);
};

exports.globalMetrics = function (test) {
	test.expect(totalAssertsPerTest);

	helpers.run("test/code/**", compare, test);
};

exports.disabledMetrics = function (test) {
	test.expect(totalAssertsPerTest);

	var options = {
		"function" : false,
		"condition" : false
	};

	helpers.run("test/code/**", compare, test, options);
};