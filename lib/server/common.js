var path = require("path");
var fs = require("fs");
var report = require("../report");

var createReportName = exports.createReportName = function (desiredName) {
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

exports.saveCoverage = function (body, adminRoot, callback) {
	var msg;
	try {
		var coverage = report.generateAll(body);
		var fileName = adminRoot + "/" + createReportName(body.name);
		
		console.log("Saving report", fileName);
		fs.writeFile(fileName, JSON.stringify(coverage), "utf-8", function (err) {
			if (err) {
				msg = "Error while saving coverage report to " + fileName;
				console.error(msg, err);
				callback.call(null, msg);
			} else {
				callback.call(null);
			}
		});
	} catch (ex) {
		msg = "Error parsing coverage report";
		console.error(msg, ex);
		callback.call(null, msg);
	}
};