var vm = require("vm");
var report = require("../lib/report");
var fileSystem = require("../lib/fileSystem");

var expectedCoverage = require("./results/code").results;
// count the number of assert expected (for each test)
var files = Object.keys(expectedCoverage);
var asserts = Object.keys(expectedCoverage[files[0]]);
var totalAssertsPerTest = 2 * files.length * asserts.length;

function compare (file, code, options) {
	//console.log(code);

	var serialized;
	var sandbox = {
		XMLHttpRequest : function () {
			this.open = function () {};
			this.setRequestHeader = function () {};
			this.send = function (data) {
				serialized = data;
			};
		},
		window : {}
	};
	vm.runInNewContext(code, sandbox, file);
	sandbox.$$_l.submit();

	var json = JSON.parse(serialized);

	var generatedReport = report.generateAll(json);

	var expected = expectedCoverage[file.substring(file.lastIndexOf("/") + 1)];
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

	assertCoverageEquals(generatedReport.files[file], expected, file);
	assertCoverageEquals(generatedReport.global, expected, file);

	waitingFiles -= 1;
	if (waitingFiles < 1) {
		testObject.done();
	}
};

function assertCoverageEquals (measured, expected, file) {
	var statementCoverage = measured.statements;
	testObject.equal(statementCoverage.total, expected.total, "total statements " + file);
	testObject.equal(statementCoverage.covered, expected.visited, "covered statements " + file);
	// being float we compare to 1E-5
	testObject.equal(statementCoverage.percentage.toFixed(5), 
		expected.statementsPercentage.toFixed(5), "percentage statements " + file);

	var conditionCoverage = measured.conditions;
	testObject.equal(conditionCoverage.total, expected.conditions, "conditions " + file);
	testObject.equal(conditionCoverage.coveredTrue, expected.conditionsTrue, "conditionsTrue " + file);
	testObject.equal(conditionCoverage.coveredFalse, expected.conditionsFalse, "conditionsFalse " + file);
	testObject.equal(conditionCoverage.percentage.toFixed(5), 
		expected.conditionsPercentage.toFixed(5), "percentage conditions " + file);

	var functionCoverage = measured.functions;
	testObject.equal(functionCoverage.total, expected.functions, "functions " + file);
	testObject.equal(functionCoverage.covered, expected.functionsCalled, "functionsCalled " + file);
	testObject.equal(functionCoverage.percentage.toFixed(5), 
		expected.functionsPercentage.toFixed(5), "percentage conditions " + file);
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