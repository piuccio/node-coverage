var express = require("express"), fs = require("fs");

var report = require("../report");;
var instrument = require("../instrument");
var common = require("./common");
var fileSystem = require("../fileSystem");

var sourceCodeCache = {
	code : {},
	highlight : {}
};

exports.start = function (docRoot, port, adminRoot, adminPort, coverageOptions) {
	var app = express.createServer();

	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({secret: "theres not much secrecy here"}));


	app.get("/*.js", function (req, res) {
		var instrumentedCode = sourceCodeCache[req.url];

		if (instrumentedCode) {
			res.send(instrumentedCode.clientCode, {"Content-Type" : "text/javascript"});
		} else {
			fs.readFile(docRoot + req.url, "utf-8", function (err, content) {
				if (err) {
					res.send("Error while reading " + req.url + err, 500);
				} else {
					var code = instrument(fileSystem.interpreters, req.url, content, coverageOptions);
					sourceCodeCache.code[req.url] = code.clientCode;

					if (!coverageOptions.doHighlight) {
						sourceCodeCache.highlight[req.url] = code.highlightedCode;
						req.session.highlightInMemory = true;
					}

					res.send(code.clientCode, {"Content-Type" : "text/javascript"});
				}
			});
		}
	});

	app.post("/node-coverage-store", function (req, res) {
		var msg;
		try {
			mergeCodeFromMemory(req.body.code, sourceCodeCache.highlight);
			var coverage = report.generateAll(req.body);

			var fileName = adminRoot + "/" + common.createReportName(req.body.name);
			
			console.log("Saving report", fileName);
			fs.writeFile(fileName, JSON.stringify(coverage), "utf-8", function (err) {
				if (err) {
					msg = "Error while saving coverage report to " + fileName;
					console.error(msg, err);
					res.send(msg, 500);
				} else {
					res.send(200);
				}
			});
		} catch (ex) {
			msg = "Error parsing coverage report";
			console.error(msg, ex);
			res.send(msg, 500);
		}
	});

	app.post("/*", function (req, res, next) {
		res.sendfile(docRoot + req.url);
	});

	app.use(express.static(docRoot));

	app.listen(port);
};

function mergeCodeFromMemory (inside, from) {
	for (var fileName in inside) {
		if (!inside[fileName].src) {
			inside[fileName] = from[fileName];
		}
	}
}