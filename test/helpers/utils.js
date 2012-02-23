var vm = require("vm");
var report = require("../../lib/report");

exports.executeCode = function (file, code, globals) {
	var serialized;
	var sandbox = {
		XMLHttpRequest : function () {
			this.open = function () {};
			this.setRequestHeader = function () {};
			this.send = function (data) {
				serialized = data;
			};
		},
		window : globals || {}
	};
	vm.runInNewContext(code, sandbox, file);
	sandbox.$$_l.submit();

	var json = JSON.parse(serialized);

	return report.generateAll(json);
};

exports.shortName = function (fileName) {
	return fileName.substring(fileName.lastIndexOf("/") + 1);
};

exports.assertCoverageEquals = function (measured, expected, file, testObject) {
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
		expected.functionsPercentage.toFixed(5), "percentage functions " + file);
};

exports.assertDetailsEquals = function (measured, expected, file, testObject) {
	var statementsDetails = measured.statements.detail;

	var totalExecutions = 0, howManyLines = 0;
	for (var lineId in statementsDetails) {
		howManyLines += 1;
		totalExecutions += statementsDetails[lineId];
	}

	testObject.equal(howManyLines, expected.statements.number, "number of statements detail " + file);
	testObject.equal(totalExecutions, expected.statements.total, "total statements detail " + file);

	var conditionsDetails = measured.conditions.detail;
	["true", "false"].forEach(function (condType) {
		testObject.equal(
			conditionsDetails[condType].length, 
			expected.conditions[condType].number, 
			"number of conditions detail " + condType + " " + file
		);
	});

	var totalConditions = 0, totalTrue = 0, totalFalse = 0;
	for (var condId in conditionsDetails.all) {
		totalConditions += 1;
		totalTrue += conditionsDetails.all[condId]["true"];
		totalFalse += conditionsDetails.all[condId]["false"];
	}
	testObject.equal(totalConditions, expected.conditions.all, "all conditions detail " + file);
	testObject.equal(totalTrue, expected.conditions["true"].total, "total true conditions detail " + file);
	testObject.equal(totalFalse, expected.conditions["false"].total, "total false conditions detail " + file);

	var functionsDetails = measured.functions.detail;
	var totalFunctions = 0, howManyFunctions = 0;
	for (var fnId in functionsDetails) {
		howManyFunctions += 1;
		totalFunctions += functionsDetails[fnId];
	}

	testObject.equal(howManyFunctions, expected.functions.number, "number of functions detail " + file);
	testObject.equal(totalFunctions, expected.functions.total, "total functions detail " + file);
};