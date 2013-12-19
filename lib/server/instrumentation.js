/**
 * Instrumentation server.
 * Serves all static files specified in document root and instrument anything
 * that has an interpreter and is not excluded.
 * It tries to answer to any possbile request (get, post, head, ...)
 */
var express = require("express");
var fs = require("fs");
var send = require("send");
var path = require("path");
var interpreters = require("../interpreters");
var instrument = require("../instrument");
var storage = require("../storage");
var file = require("../file");
var report = require("../report");

/**
 * Start a server instance
 *
 * @param {String} docRoot Document root, base folder for all statics
 * @param {Number} port Server port
 * @param {String} adminRoot Folder where all reports are to be saved
 * @param {Number} adminPort Administration server's port (not used)
 * @param {Object} coverageOptions [Optional] Additional option
 * @param {Function} onClose [Optional] Callback to be called when closing the server
 */
exports.start = function (docRoot, port, adminRoot, adminPort, coverageOptions, onClose) {
	var app = express();

	// Parse the body of a report submit
	app.use(express.bodyParser());

	// Number of requests currently waiting to be stored
	var whileStoringCoverage = 0;

	// Handle any connection request serving instrumented files
	app.use(function (req, res, next) {
		var pathname = req.path;
		var onDisk = path.join(docRoot, pathname);

		if (coverageOptions.verbose) {
			console.log("Requesting", pathname);
		}

		var headers = {
			"Content-Type": "text/javascript",
			"Connection": "close"
		};

		if (pathname === "/node-coverage-store" && req.method === "POST") {
			whileStoringCoverage += 1;
			saveReport(getBody(req, coverageOptions), adminRoot, coverageOptions, function (error) {
				whileStoringCoverage -= 1;
				if (error) {
					console.log(error);
					res.send(500, error);
				} else {
					res.send(200, coverageOptions["exit-on-submit"] ? {"Connection": "close"} : null);
				}

				if (coverageOptions["exit-on-submit"]) {
					process.nextTick(function () {
						server.close(onClose);
					});
				}
			});
		} else if (!!interpreters.getInterpreter(pathname)) {
			// There's at least an interpreter, although I'm not sure it's the best
			fs.readFile(onDisk, "utf-8", function (error, text) {
				if (error) {
					next();
				} else {
					if (coverageOptions.verbose) {
						console.log("Instrumenting", onDisk);
					}
					var code = instrument(pathname, text, coverageOptions);

					res.type(path.extname(onDisk));
					res.send(code.clientCode);
				}
			});
		} else {
			send(req, pathname)
				.root(docRoot)
				.pipe(res);
		}
	});

	app.all("/node-coverage-please-exit", function (req, res) {
		function exitWhenDone () {
			if (whileStoringCoverage) {
				setTimeout(exitWhenDone, 100);
			} else {
				res.send(200, {"Connection": "close"});
				process.nextTick(function () {
					server.close(onClose);
				});
			}
		}
		exitWhenDone();
	});

	var server = app.listen(port);
	return server;
};

/**
 * Save a report in a storage location
 *
 * @param {Object} body Report sent by the client
 * @param {String} destination Base folder where the report is stored
 * @param {Object} options Additional option, used to get a storage location
 * @param {Function} callback Called when the report is stored
 */
function saveReport (body, destination, options, callback) {
	if (!body) {
		return callback("Unable to parse report");
	}
	var reportName = file.createReportName(body.name);

	try {
		var coverage = report.generateAll(body);
		var fullPath = path.join(destination, reportName);

		coverage.name = reportName;
		var json = JSON.stringify(coverage);

		console.log("Saving report", fullPath);
		storage(options).save(fullPath, json, callback);
	} catch (ex) {
		callback(ex);
	}
}

/**
 * Extract the message body from the request object
 * @param {Object} request Node request object
 * @param {Object} coverageOptions Options for coverage
 */
function getBody (request, coverageOptions) {
	if (request.headers && request.headers["content-type"] === "application/x-www-form-urlencoded") {
		// Using a real form submit the coverage reports happens to be a string
		try {
			return JSON.parse(request.body.coverage);
		} catch (ex) {
			if (coverageOptions.verbose) {
				console.error("[ERROR] Unable to parse client request.", ex);
			}
			return false;
		}
	} else {
		return request.body;
	}
}
