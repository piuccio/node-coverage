/**
 * Utilities functions needed to simplify test logic.
 */
var vm = require("vm");
var report = require("../../lib/report");
var path = require("path");
var fileSystem = require("../../lib/fileSystem");
var instrument = require("../../lib/instrument");
var net = require("net");
var http = require("http");

/**
 * Execute a given callback on a pattern of files. This will read the file,
 * instrument the code, execute it in a simulated context and return the
 * generated report.
 * It also handles the promise returned by fileSystem in order to end the test cleanly
 *
 * @param {String} pattern Glob pattern
 * @param {Function} callback Function executed on every file
 * @param {Object} test Test object from nodeunit
 * @param {Object} options [Optional] Parameters for the interpret function
 * @param {Function} then [Optional] Function to be called in the 'then' callback
 */
exports.run = function (pattern, callback, test, options, then, run) {
	fileSystem.perform(pattern, function (error, file, code) {
		if (error) {
			// Inside the if to avoid incrementing the assert counter
			test.ifError(error);
		}
		var code = instrument(file, code, options).clientCode;

		var report = run !== false ? executeCode(file, code) : null;
		callback(test, file, code, report, options);
	}, options).then(function () {
		if (then) {
			then(test);
		}
		test.done()
	}, function (error) {
		test.ifError(error);
		test.ok(false, "Perform action failed");
		test.done();
	});
};

/**
 * Execute some code inside a new context and get the report
 * The report is obtained overriding XMLHttpRequest with a simple json serializer
 *
 * @param {String} file Name of the file
 * @param {String} code Code to be executed (already instrumented)
 * @param {Object} global This corresponds to `window` in the context
 *
 * @return {Object} Report as JSON object
 */
exports.executeCode = executeCode = function (file, code, globals) {
	var serialized;
	var window = globals || {};
	var sandbox = {
		XMLHttpRequest : window.XMLHttpRequest || function () {
			this.open = function () {};
			this.setRequestHeader = function () {};
			this.send = function (data) {
				serialized = data;
			};
		},
		window : window
	};
	vm.runInNewContext(code, sandbox, file);
	sandbox.$$_l.submit();

	if (serialized) {
		var json = JSON.parse(serialized);

		return report.generateAll(json);
	}
};

/**
 * Get the base name of a report
 *
 * @param {String} fileName Full path
 *
 * @return {String} Basename
 */
exports.shortName = function (fileName) {
	return path.basename(fileName);
};

/**
 * Assert that two coverage reports are equal.
 * This function performs 10 assertions
 *
 * @param {Object} measured Report measured by the test
 * @param {Object} expteced Representation of the expected results
 * @param {String} file File name, used in logs
 * @param {Object} testObject Test instance
 */
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

exports.clusterFunctions = function (functions) {
	var map = {};
	functions.forEach(function (item) {
		var match = /(\D+)_\d+_\d+_\d+$/.exec(item);
		var name = match[1];

		if (!map[name]) {
			map[name] = 0;
		}
		
		map[name] += 1;
	});

	return map;
};

exports.objectEquals = function (compare, expected) {
	for (var key in compare) {
		if (expected[key] !== compare[key]) {
			return false;
		}
	}

	for (var key in expected) {
		if (compare[key] !== expected[key]) {
			return false;
		}
	}

	return true;
};

/**
 * Get a random available port
 *
 * @param {Number} iterations How many times we should retry before obtaining a port
 * @param {Function} callback Called when a port is available
 */
exports.getPort = function (iterations, callback) {
	if (iterations <= 0) {
		callback(new Error("Unable to find an open port"));
	} else {
		var randomPort = Math.floor(Math.random() * 2000 + 8000);
		
		net.createServer().listen(randomPort).on("error", function () {
			// Try a different port
			getPort(iterations - 1, callback);
		}).on("listening", function (a, b) {
			this.close();
			callback(null, randomPort);
		});
	}
};

/**
 * Get a file hosted on this server at a given port
 *
 * @param {String} name File name
 * @param {Number} port Port number
 * @param {Function} callback Called when the file is downloaded
 */
exports.getFile = function (name, port, callback) {
	http.get({
		port : port,
		path : name
	}, function (res) {
		if (res.statusCode === 200) {
			var buffer = "";

			res.setEncoding("utf8");
			res.on("data", function (chunk) {
			    buffer += chunk;
			}).on("end", function () {
				callback(null, buffer);
			});
		} else {
			callback(new Error("Response status : " + res.statusCode));
		}
	}).on("error", function (error) {
		callback(error);
	});
};

/**
 * Generate an XMLHttpRequest object able to send a report to the server
 *
 * @param {Function} callback Called when the submit is sent
 */
exports.xhr = function (port, callback) {
	return function () {
		this.open = function () {};
		this.setRequestHeader = function () {};
		this.send = function (data) {
			var req = http.request({
				port : port,
				path : "/node-coverage-store",
				method : "POST",
				headers : {
					"Content-Type" : "application/json"
				}
			}, function (res) {
				if (res.statusCode === 200) {
					var buffer = "";

					res.setEncoding("utf8");
					res.on("data", function (chunk) {
					    buffer += chunk;
					}).on("end", function () {
						callback(null, buffer);
					});
				} else {
					callback(new Error("Response status : " + res.statusCode));
				}
			}).on("error", function (error) {
				callback(error);
			});

			req.write(data);

			req.end();
		};
	}
};

/**
 * Start a server instance on two random ports
 *
 * @param {Object} Server's module instance
 * @param {Object} options
 *    docRoot {String} Document root
 *    adminRoot {String} Administration root
 *    coverageOptions {Object} Optional coverage configuration
 *    timeout {Integer} Timeout in ms, default 1000
 * @param {Function} callback With the signature
 *    function (error, port, adminPort, instance)
 *       [error] Error if any, or null
 *       [port] Port for the document root
 *       [adminPort] Port for the administrative root
 *       [instance] Server instance
 */
exports.startServer = function (module, options, callback) {
	exports.getPort(5, function (error, portOne) {
		if (error) {
			callback(error);
		} else {
			exports.getPort(5, function (error, portTwo) {
				if (error) {
					callback(error);
				} else {
					doStart(
						module,
						options.docRoot,
						portOne,
						options.adminRoot,
						portTwo,
						options.coverageOptions,
						options.timeout || 1000,
						callback
					);
				}
			});
		}
	});
}

doStart = function (server, docRoot, port, adminRoot, adminPort, coverageOptions, timeout, callback) {
	var instance = server.start(docRoot, port, adminRoot, adminPort, coverageOptions);
	instance.on("listening", function () {
		callback(null, port, adminPort, instance);
	});
	instance.on("close", function () {
		clearTimeout(killer);
		killer = null;
	});

	var killer = setTimeout(function () {
		if (killer) {
			instance.close();
		}
	}, timeout);
}