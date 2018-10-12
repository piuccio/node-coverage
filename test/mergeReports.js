var helpers = require("./helpers/utils");
var report = require("../lib/report");
var fileSystem = require("../lib/fileSystem");

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

function measureCoverage (file, code) {
	var generatedReport = helpers.executeCode(file, code);
	var shortFileName = helpers.shortName(file);

	var expected = expectedCoverage[shortFileName];
	generatedReports[shortFileName] = generatedReport;

	helpers.assertCoverageEquals(generatedReport.files[file], expected, file, testObject);
	helpers.assertCoverageEquals(generatedReport.global, expected, file, testObject);

	waitingFiles -= 1;
	if (waitingFiles < 1) {
		assertMerge();
		testObject.done();
	}
};

function assertMerge () {
	merge_1_and_2(testObject);

	merge_with_itself("test/reports/file1.js", testObject);

	merge_with_itself("test/reports/file2.js", testObject);

	merge_with_itself("test/reports/file3.js", testObject);
};

function merge_1_and_2 (testObject) {
	var merged = report.mergeReports([
		generatedReports["file1.js"], generatedReports["file2.js"]
	]);

	// File reports shouldn't change
	for (var fileName in merged.files) {
		var shortFileName = helpers.shortName(fileName);

		helpers.assertCoverageEquals(merged.files[fileName], expectedCoverage[shortFileName], shortFileName, testObject);

		helpers.assertDetailsEquals(merged.files[fileName], expectedDetails.merge[shortFileName], shortFileName, testObject);
	}
	helpers.assertCoverageEquals(merged.global, expectedCoverage["merge_1_2"], "merge_1_2", testObject);
};

function merge_with_itself (fileName, testObject) {
	var shortFileName = helpers.shortName(fileName);
	var merged = report.mergeReports([
		generatedReports[shortFileName], generatedReports[shortFileName]
	]);

	helpers.assertCoverageEquals(merged.files[fileName], expectedCoverage[shortFileName], "merge_" + shortFileName, testObject);
	helpers.assertCoverageEquals(merged.global, expectedCoverage[shortFileName], "global_" + shortFileName, testObject);

	helpers.assertDetailsEquals(merged.files[fileName], expectedDetails.mergeSelf[shortFileName], "merge_" + shortFileName, testObject);
};


function mergeSpecial (file, code) {
	// Run file3 with different global variables -> different paths
	var generatedReportTrue = helpers.executeCode(file, code, {
		thisIsAGlobalVariable : false
	});
	var generatedReportFalse = helpers.executeCode(file, code, {
		thisIsAGlobalVariable : true
	});

	var specialCoverage = expectedDetails.mergeSpecial.coverage;
	var specialDetails = expectedDetails.mergeSpecial.details;

	var merged = report.mergeReports([
		generatedReportTrue, generatedReportFalse
	]);

	helpers.assertCoverageEquals(merged.files[file], specialCoverage, "special", testObject);
	helpers.assertCoverageEquals(merged.global, specialCoverage, "global special", testObject);

	helpers.assertDetailsEquals(merged.files[file], specialDetails, "details special", testObject);
	
	testObject.done();
};

var testObject;
var waitingFiles = 3;
var generatedReports = {};

exports.mergeResults = function (test) {
	test.expect(totalAssertsPerTest);

	testObject = test;

	fileSystem.instrumentFolder("test/reports", "", measureCoverage, {
		"function" : true,
		"condition" : true
	});
};

exports.differentGlobals = function (test) {
	// this special test does 2 assertCoverageEquals and 1 assertDetailsEquals
	test.expect(2 * asserts.length + 9);

	testObject = test;

	fileSystem.instrumentFile("test/reports/file3.js", "", mergeSpecial, {
		"function" : true,
		"condition" : true
	});
};