/**
 * Generate a coverage report for a list of file.
 * 
 * The report contains:
 *
 *  global : summary of the global coverage
 *     statements
 *        total : total number of lines,
 *        covered : number of exectuded statement,
 *        percentage : percentage of covered statements, float 0<>100,
 *     conditions
 *        total : total number of conditions,
 *        coveredTrue : number of conditions evaluated to true,
 *        coveredFalse : number of conditions evaluated to false,
 *        percentage : percentage of conditions evaluated both true and false,
 *     functions
 *        total : total number of functions,
 *        covered : number of functions that have been called (including empty functions),
 *        percentage : percentage of functions called
 *  files : map of single reports for every file @see generate
 *  functions : history of all covered functions
 */
function generateAll (descriptor) {
	var globalReport = {
		statements : {
			total : 0,
			covered : 0,
			percentage : 0
		},
		conditions : {
			total : 0,
			coveredTrue : 0,
			coveredFalse : 0,
			percentage : 100
		},
		functions : {
			total : 0,
			covered : 0,
			percentage : 100
		}
	};
	var filesReport = {};

	descriptor.fnCalled = organizeFunctionCallsByFile(descriptor.runFunctions);
	
	for (var file in descriptor.lines) {
		if (descriptor.lines.hasOwnProperty(file)) {
			var fileReport = generate(file, descriptor);
			filesReport[file] = fileReport;

			globalReport.statements.total += fileReport.statements.total;
			globalReport.statements.covered += fileReport.statements.covered;

			globalReport.conditions.total += fileReport.conditions.total;
			globalReport.conditions.coveredTrue += fileReport.conditions.coveredTrue;
			globalReport.conditions.coveredFalse += fileReport.conditions.coveredFalse;

			globalReport.functions.total += fileReport.functions.total;
			globalReport.functions.covered += fileReport.functions.covered;
		}
	}
	globalReport.statements.percentage = 100.0 / globalReport.statements.total
		* globalReport.statements.covered;
	if (globalReport.conditions.total) {
		globalReport.conditions.percentage = 50.0 / globalReport.conditions.total
			* (globalReport.conditions.coveredTrue + globalReport.conditions.coveredFalse);
	}
	if (globalReport.functions.total) {
		globalReport.functions.percentage = 100.0 / globalReport.functions.total
			* globalReport.functions.covered;
	}

	return {
		global : globalReport,
		files : filesReport,
		functions : descriptor.runFunctions
	};
};

function organizeFunctionCallsByFile (coveredFunctions) {
	var byFile = {};
	coveredFunctions.forEach(function (fnDescriptor) {
		var file = fnDescriptor[0];
		var fnName = fnDescriptor[1] + fnDescriptor[2];
		if (!byFile[file]) {
			byFile[file] = {};
		}
		if (byFile[file][fnName] == null) {
			byFile[file][fnName] = 0;
		}
		byFile[file][fnName] += 1;
	});
	return byFile;
};

/**
 * Generate a coverage report for a single file.
 * 
 * The report contains:
 *
 *  code : 'highlighted' code it's an array of lines of code @see highlight module,
 *  statements
 *     total : total number of lines,
 *     covered : number of exectuded statement,
 *     detail : coverage detail for every line, how many times that statement was called,
 *     percentage : percentage of covered statements, float 0<>100,
 *  conditions
 *     total : total number of conditions,
 *     coveredTrue : number of conditions evaluated to true,
 *     coveredFalse : number of conditions evaluated to false,
 *     detail : list of conditions that evaluated 'true' or 'false' and 'all'
 *     percentage : percentage of conditions evaluated both true and false (100 if no conditions),
 *  functions
 *     total : total number of functions,
 *     covered : number of functions that have been called (including empty functions),
 *     percentage : percentage of functions called,
 *     detail : coverage detail of functions, how many times the function was called
 */
function generate (file, container) {
	return {
		code : container.code[file],
		statements : statementCoverage(container.lines[file], container.runLines[file]),
		conditions : conditionCoverage(container.allConditions[file], container.conditions[file]),
		functions : functionCoverage(container.allFunctions[file], container.fnCalled[file])
	};
};

function statementCoverage (allLines, coveredLines) {
	var covered = 0;
	allLines.forEach(function (line) {
		if (coveredLines[line] > 0) {
			covered += 1;
		}
	});

	return {
		total : allLines.length,
		covered : covered,
		detail : coveredLines,
		percentage : 100.0 * covered / allLines.length
	};
};

function conditionCoverage (allConditions, coveredConditions) {
	var met = {}, metTrue = [], metFalse = [];
	allConditions.forEach(function (condition) {
		met[condition] = {
			"true" : 0,
			"false" : 0
		};
	});

	coveredConditions.forEach(function (condition) {
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

	return {
		total : allConditions.length,
		coveredTrue : metTrue.length,
 		coveredFalse : metFalse.length,
 		detail : {
			"true" : metTrue,
			"false" : metFalse,
			"all" : met
		},
 		percentage : allConditions.length == 0 ?
			100 : // no conditions means we covered them all
			50.0 * (metTrue.length + metFalse.length) / allConditions.length
				// 50.0 because every condition counts for 2
	};
};

function functionCoverage(allFunctions, coveredFunctions) {
	// coveredFunctions has only the functions that were called
	detail = coveredFunctions || {};
	var fnTotal = allFunctions.length, fnCalled = 0;
	allFunctions.forEach(function (fnName) {
		if ((fnName in detail) && detail[fnName] > 0) {
			fnCalled += 1;
		} else {
			detail[fnName] = 0;
		}
	});
	
	return {
		total : fnTotal,
		covered : fnCalled,
		percentage : fnTotal == 0 ? 100 : (100.0 * fnCalled / fnTotal),
		detail : detail
	};
};


function mergeReports (reports) {
	var merged = {
		global : {
			statements : {
				total : 0,
				covered : 0,
				percentage : 0
			},
			conditions : {
				total : 0,
				coveredTrue : 0,
				coveredFalse : 0,
				percentage : 100
			},
			functions : {
				total : 0,
				covered : 0,
				percentage : 100
			}
		},
		files : {}
	};

	reports.forEach(function (report) {
		for (var fileName in report.files) {
			if (!merged.files[fileName]) {
				merged.files[fileName] = report.files[fileName];
			} else {
				merged.files[fileName].statements = mergeStatementsOrFunctions(
					merged.files[fileName].statements, report.files[fileName].statements
				);
				merged.files[fileName].conditions = mergeConditions(
					merged.files[fileName].conditions, report.files[fileName].conditions
				);
				merged.files[fileName].functions = mergeStatementsOrFunctions(
					merged.files[fileName].functions, report.files[fileName].functions
				);
			}
		}
	});

	for (var fileReport in merged.files) {
		var report = merged.files[fileReport];
		
		merged.global.statements.total += report.statements.total;
		merged.global.statements.covered += report.statements.covered;

		merged.global.conditions.total += report.conditions.total;
		merged.global.conditions.coveredTrue += report.conditions.coveredTrue;
		merged.global.conditions.coveredFalse += report.conditions.coveredFalse;

		merged.global.functions.total += report.functions.total;
		merged.global.functions.covered += report.functions.covered;
	}
	merged.global.statements.percentage = 100.0 / merged.global.statements.total
		* merged.global.statements.covered;
	if (merged.global.conditions.total) {
		merged.global.conditions.percentage = 50.0 / merged.global.conditions.total
			* (merged.global.conditions.coveredTrue + merged.global.conditions.coveredFalse);
	}
	if (merged.global.functions.total) {
		merged.global.functions.percentage = 100.0 / merged.global.functions.total
			* merged.global.functions.covered;
	}

	return merged;
};

function mergeStatementsOrFunctions (one, two) {
	var merged = {
		total : 0,
		covered : 0,
		detail : {},
		percentage : 0
	};
	for (var lineId in one.detail) {
		merged.detail[lineId] = one.detail[lineId] + two.detail[lineId];

		merged.total += 1;
		if (merged.detail[lineId] > 0) {
			merged.covered += 1;
		}
	}

	merged.percentage = merged.total ? 100.0 * merged.covered / merged.total : 100.0;

	return merged;
};

function mergeConditions (one, two) {
	var merged = {
		total : one.total,
		coveredTrue : 0,
		coveredFalse : 0,
		detail : {
			"true" : [],
			"false" : [],
			"all" : {}
		},
		percentage : 0
	};

	["true", "false"].forEach(function (condType) {
		merged.detail[condType] = one.detail[condType].slice(0);

		two.detail[condType].forEach(function (condId) {
			if (merged.detail[condType].indexOf(condId) === -1) {
				merged.detail[condType].push(condId);
			}
		});

		merged[condType == "true" ? "coveredTrue" : "coveredFalse"] = merged.detail[condType].length;
	});

	for (var condId in one.detail.all) {
		merged.detail.all[condId] = {
			"true" : one.detail.all[condId]["true"] + two.detail.all[condId]["true"],
			"false" : one.detail.all[condId]["false"] + two.detail.all[condId]["false"]
		};
	}
	

	merged.percentage = merged.total ? 
		50.0 * (merged.coveredTrue + merged.coveredFalse) / merged.total : 100;

	return merged;
};

exports.generate = generate;
exports.generateAll = generateAll;
exports.mergeReports = mergeReports;
exports.stats = require("./statistics");