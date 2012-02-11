var express = require("express"), fs = require("fs"), path = require("path");

var report = require("../report");;
var instrument = require("../instrument");

function createReportName (desiredName) {
	var now = new Date();

	var name = "report";
	if (desiredName) {
		desiredName = path.basename(desiredName);

		if (desiredName.charAt(0) !== ".") {
			name = desiredName;
		}
	}
	
	return name + "_" + now.getTime() + ".json";
};


exports.start = function (docRoot, port, adminRoot, adminPort, coverageOptions) {
	var app = express.createServer();

	app.use(express.bodyParser());


	app.get(/\.js$/, function (req, res) {
		fs.readFile(docRoot + req.url, "utf-8", function (err, content) {
			if (err) {
				res.send("Error while reading " + req.url + err, 500);
			} else {
				var code = instrument.instrument(req.url, content, coverageOptions);

				res.send(code, {"Content-Type" : "text/javascript"});
			}
		});
	});

	app.post("/node-coverage-store", function (req, res) {
		var msg;
		try {
			var coverage = report.generateAll(req.body);

			var fileName = adminRoot + "/" + createReportName(req.body.name);
			
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

	app.use(express.static(docRoot));

	app.listen(port);
};