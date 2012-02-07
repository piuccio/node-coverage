/**
 * Generate a coverage report for a single file.
 * 
 * The report contains:
 *
 *  total : total number of lines,
 *  visited : number of exectuded statement,
 *  percentage : percentage of covered statements, float 0<>100,
 *  detail : coverage detail for every line, how many times that statement was called,
 *  code : 'highlighted' code it's an array of lines of code @see highlight module,
 *  conditions : total number of conditions,
 *  conditionsTrue : number of conditions evaluated to true,
 *  conditionsFalse : number of conditions evaluated to false,
 *  conditionsDetail : list of conditions that evaluated 'true' or 'false' and 'all'
 *  conditionsPercentage : percentage of conditions evaluated both true and false (100 if no conditions),
 *  functions : total number of functions,
 *  functionsCalled : number of functions that have been called (including empty functions),
 *  functionsPercentage : percentage of functions called
 */
function generate (file, container) {
	var run = container.runLines[file],
		lines = container.lines[file],
		visited = 0;
	lines.forEach(function (line) {
		if (run[line] > 0) {
			visited += 1;
		}
	});

	var allConditions = container.allConditions[file];
	var met = {}, metTrue = [], metFalse = [];
	allConditions.forEach(function (condition) {
		met[condition] = {
			"true" : 0,
			"false" : 0
		};
	});

	container.conditions[file].forEach(function (condition) {
		var condId = condition[0], condBool = condition[1];
		met[condId][condBool] += 1;
		if (condBool) {
			if (metTrue.indexOf(condId) === -1) {
				metTrue.push(condId);
			}
		} else {
			if (metFalse.indexOf(condId) === -1) {
				metFalse.push(condId);
			}
		}
	});

	var fnTotal = container.allFunctions[file].length, fnCalled = 0;
	for (var fn in container.fnCalled[file]) {
		if (container.fnCalled[file][fn] > 0) {
			fnCalled += 1;
		}
	};

	// TODO, group statement/condition/function please
	return {
		total : lines.length,
		visited : visited,
		percentage : 100.0 * visited / lines.length,
		detail : container.runLines[file],
		code : container.code[file],
		conditions : allConditions.length,
		conditionsTrue : metTrue.length,
		conditionsFalse : metFalse.length,
		conditionsDetail : {
			"true" : metTrue,
			"false" : metFalse,
			"all" : met
		},
		conditionsPercentage : allConditions.length == 0 ?
			100 : // no conditions means we pass all of them
			50.0 * (metTrue.length + metFalse.length) / allConditions.length,
				// 50.0 because every condition counts for 2
		functions : fnTotal,
		functionsCalled : fnCalled,
		functionsPercentage : fnTotal == 0 ? 100 : (100.0 * fnCalled / fnTotal)
	};
};

/**
 * Generate a coverage report for a list of file.
 * 
 * The report contains:
 *
 *  global : summary of the global coverage
 *     total : total number of lines,
 *     visited : number of exectuded statement,
 *     percentage : percentage of covered statements, float 0<>100,
 *     conditions : total number of conditions,
 *     conditionsTrue : number of conditions evaluated to true,
 *     conditionsFalse : number of conditions evaluated to false,
 *     conditionsPercentage : percentage of conditions evaluated both true and false,
 *     functions : total number of functions,
 *     functionsCalled : number of functions that have been called (including empty functions),
 *     functionsPercentage : percentage of functions called
 *  files : map of single reports for every file
 */
function generateAll (descriptor) {
	var report = {
		global : {
			total : 0,
			visited : 0,
			percentage : 0,
			conditions : 0,
			conditionsTrue : 0,
			conditionsFalse : 0,
			conditionsPercentage : 0,
			functions : 0,
			functionsCalled : 0
		},
		files : {}
	};
	// group function calls by file
	descriptor.fnCalled = {};
	descriptor.runFunctions.forEach(function (fnDescriptor) {
		var file = fnDescriptor[0];
		var fnName = fnDescriptor[1] + fnDescriptor[2];
		if (!descriptor.fnCalled[file]) {
			descriptor.fnCalled[file] = {};
		}
		if (descriptor.fnCalled[file][fnName] == null) {
			descriptor.fnCalled[file][fnName] = 0;
		}
		descriptor.fnCalled[file][fnName] += 1;
	});

	// generate single reports
	for (var file in descriptor.lines) {
		if (descriptor.lines.hasOwnProperty(file)) {
			var fileReport = generate(file, descriptor);
			report.files[file] = fileReport;

			report.global.total += fileReport.total;
			report.global.visited += fileReport.visited;
			report.global.conditions += fileReport.conditions;
			report.global.conditionsTrue += fileReport.conditionsTrue;
			report.global.conditionsFalse += fileReport.conditionsFalse;
			report.global.functions += fileReport.functions;
			report.global.functionsCalled += fileReport.functionsCalled;
		}
	}
	report.global.percentage = 100.0 * report.global.visited / report.global.total;
	report.global.conditionsPercentage = 50.0 * (report.global.conditionsTrue + report.global.conditionsFalse) / report.global.conditions;
	report.global.functionsPercentage = 100.0 * report.global.functionsCalled / report.global.functions;

	return report;
};

exports.generate = generate;
exports.generateAll = generateAll;