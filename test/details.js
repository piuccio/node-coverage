var helpers = require("./helpers/utils");

var expectedCoverage = require("./results/details").results;
var totalAssertsPerFile = 9;

function compare (test, file, code, report) {
	var shortFileName = helpers.shortName(file);

	var expected = expectedCoverage.code[shortFileName] || expectedCoverage.merge[shortFileName];

	helpers.assertDetailsEquals(report.files[file], expected, file, test);
};

exports.codeDetails = function (test) {
	var files = Object.keys(expectedCoverage.code);
	test.expect(files.length * totalAssertsPerFile);

	helpers.run("test/code/**", compare, test);
};

exports.mergeDetails = function (test) {
	var files = Object.keys(expectedCoverage.merge);
	test.expect(files.length * totalAssertsPerFile);

	helpers.run("test/reports/**", compare, test);
};