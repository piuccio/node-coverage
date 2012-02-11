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
	var globalResult = generatedReport.global;
	var result = generatedReport.files[file];

	var expected = expectedCoverage[file.substring(file.lastIndexOf("/") + 1)];
	if (options && options["condition"] === false) {
		expected.conditions = 0;
		expected.conditionsTrue = 0;
		expected.conditionsFalse = 0;
	}
	if (options && options["function"] === false) {
		expected.functions = 0;
		expected.functionsCalled = 0;
	}

	testObject.equal(result.total, expected.total, "total " + file);
	testObject.equal(result.visited, expected.visited, "visited " + file);

	testObject.equal(result.conditions, expected.conditions, "conditions " + file);
	testObject.equal(result.conditionsTrue, expected.conditionsTrue, "conditionsTrue " + file);
	testObject.equal(result.conditionsFalse, expected.conditionsFalse, "conditionsFalse " + file);

	testObject.equal(result.functions, expected.functions, "functions " + file);
	testObject.equal(result.functionsCalled, expected.functionsCalled, "functionsCalled " + file);

	// Since we test one file at the time, global results should be equal
	testObject.equal(globalResult.total, expected.total, "global total " + file);
	testObject.equal(globalResult.visited, expected.visited, "global visited " + file);

	testObject.equal(globalResult.conditions, expected.conditions, "global conditions " + file);
	testObject.equal(globalResult.conditionsTrue, expected.conditionsTrue, "global conditionsTrue " + file);
	testObject.equal(globalResult.conditionsFalse, expected.conditionsFalse, "global conditionsFalse " + file);

	testObject.equal(globalResult.functions, expected.functions, "global functions " + file);
	testObject.equal(globalResult.functionsCalled, expected.functionsCalled, "global functionsCalled " + file);

	waitingFiles -= 1;
	if (waitingFiles < 1) {
		testObject.done();
	}
};

function compareWithOptions (options) {
	return function (file, code) {
		compare(file, code, options);
	};
}

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