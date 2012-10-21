var helpers = require("./helpers/utils");
var report = require("../lib/report");

var expectedCoverage = require("./results/reports").results;
var expectedDetails = require("./results/details").results;
// count the number of assert expected (for each test)
var files = Object.keys(expectedCoverage);
var asserts = Object.keys(expectedCoverage[files[0]]);
// This test will call  assertCoverageEquals
//    twice for every file
//    three times for the merge 1_2
//    twice for every file merged with itself
//    
// and  assertDetailsEquals  (9 asserts)
//    twice merging 1 and 2
//    once for every file merged with itself
var totalAssertsPerTest = (15 * asserts.length) + (5 * 9);

function measureCoverage (test, file, code, report) {
	var shortFileName = helpers.shortName(file);

	var expected = expectedCoverage[shortFileName];
	generatedReports[shortFileName] = report;

	helpers.assertCoverageEquals(report.files[file], expected, file, test);
	helpers.assertCoverageEquals(report.global, expected, file, test);
};

function assertMerge (test) {
	merge_1_and_2(test);

	merge_with_itself("test/reports/file1.js", test);

	merge_with_itself("test/reports/file2.js", test);

	merge_with_itself("test/reports/file3.js", test);
};

function merge_1_and_2 (test) {
	var merged = report.mergeReports([
		generatedReports["file1.js"], generatedReports["file2.js"]
	]);

	// File reports shouldn't change
	for (var fileName in merged.files) {
		var shortFileName = helpers.shortName(fileName);

		helpers.assertCoverageEquals(merged.files[fileName], expectedCoverage[shortFileName], shortFileName, test);

		helpers.assertDetailsEquals(merged.files[fileName], expectedDetails.merge[shortFileName], shortFileName, test);
	}
	helpers.assertCoverageEquals(merged.global, expectedCoverage["merge_1_2"], "merge_1_2", test);
};

function merge_with_itself (fileName, test) {
	var shortFileName = helpers.shortName(fileName);
	var merged = report.mergeReports([
		generatedReports[shortFileName], generatedReports[shortFileName]
	]);

	helpers.assertCoverageEquals(merged.files[fileName], expectedCoverage[shortFileName], "merge_" + shortFileName, test);
	helpers.assertCoverageEquals(merged.global, expectedCoverage[shortFileName], "global_" + shortFileName, test);

	helpers.assertDetailsEquals(merged.files[fileName], expectedDetails.mergeSelf[shortFileName], "merge_" + shortFileName, test);
};


function mergeSpecial (test, file, code) {
	// Run file3 with different global variables -> different paths
	var generatedReportTrue = helpers.executeCode(file, code, {
		thisIsAGlobalVariable : false
	});
	var generatedReportFalse = helpers.executeCode(file, code, {
		thisIsAGlobalVariable : true
	});

	var shortFileName = helpers.shortName(file);

	var specialCoverage = expectedDetails.mergeSpecial.coverage;
	var specialDetails = expectedDetails.mergeSpecial.details;

	var merged = report.mergeReports([
		generatedReportTrue, generatedReportFalse
	]);

	helpers.assertCoverageEquals(merged.files[file], specialCoverage, "special", test);
	helpers.assertCoverageEquals(merged.global, specialCoverage, "global special", test);

	helpers.assertDetailsEquals(merged.files[file], specialDetails, "details special", test);
};

var generatedReports = {};

exports.mergeResults = function (test) {
	test.expect(totalAssertsPerTest);

	helpers.run("test/reports/**", measureCoverage, test, {
		"function" : true,
		"condition" : true
	}, function (test) {
		assertMerge(test);
	});
};

exports.differentGlobals = function (test) {
	// this special test does 2 assertCoverageEquals and 1 assertDetailsEquals
	test.expect(2 * asserts.length + 9);

	helpers.run("test/reports/file3.js", mergeSpecial, test, {
		"function" : true,
		"condition" : true
	});
};