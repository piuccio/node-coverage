var express = require("express"), fs = require("fs");

var instrument = require("../instrument");
var common = require("./common");

exports.start = function (docRoot, port, adminRoot, coverageOptions, onClose, initialStaticInfo) {
	var sourceCodeCache = {
		code : {},
		staticInfo : initialStaticInfo || {}
	};

	var app = express.createServer();

	app.use(express.bodyParser());

	app.get("/*.js", function (req, res) {
		var url = req.path;
		var instrumentedCode = sourceCodeCache[url];

		if (coverageOptions.verbose) {
			console.log("Requesting", url);
		}

		var headers = {
			"Content-Type": "text/javascript",
			"Connection": "close"
		};

		if (instrumentedCode) {
			res.send(instrumentedCode.clientCode, headers);
		} else {
			fs.readFile(docRoot + url, "utf-8", function (err, content) {
				if (err) {
					res.send("Error while reading " + url + err, 500);
				} else {
					if (coverageOptions.verbose) {
						console.log("Instrumenting", docRoot + url);
					}
					var code = instrument(url, content, coverageOptions);
					sourceCodeCache.code[url] = code.clientCode;

					if (code.staticInfo && coverageOptions.staticInfo === false) {
						sourceCodeCache.staticInfo[url] = code.staticInfo;
					}

					res.send(code.clientCode, headers);
				}
			});
		}
	});

	var whileStoringCoverage = 0;
	app.post("/node-coverage-store", function (req, res) {
		whileStoringCoverage += 1;
		if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
			// Using a real form submit the coverage reports happens to be a string
			req.body = JSON.parse(req.body.coverage);
		}

		common.saveCoverage(req.body, sourceCodeCache.staticInfo, adminRoot, function (error) {
			whileStoringCoverage -= 1;
			if (error) {
				res.send(error, 500);
			} else {
				res.send(200, coverageOptions["exit-on-submit"] ? {"Connection": "close"} : null);
			}

			if (coverageOptions["exit-on-submit"]) {
				process.nextTick(function () {
					server.close(onClose);
				});
			}
		});
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

	app.post("/*", function (req, res, next) {
		res.sendfile(docRoot + req.path);
	});

	app.use(express.static(docRoot));

	var server = app.listen(port);
	return server;
};
