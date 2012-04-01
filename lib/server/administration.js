var express = require("express"), fs = require("fs"), path = require("path");

var report = require("../report");
var common = require("./common");

exports.start = function (docRoot, port, adminRoot, adminPort) {
	var app = express.createServer();

	app.set("view engine", "jade");
	app.set("view options", {
		layout: false
	});
	app.set("jsonp callback", true);

	app.set("views", __dirname + "/../../views");
	app.use(express.static(__dirname + "/../../views/statics"));

	app.get("/", function (req, res) {
		fs.readdir(adminRoot, function (err, files) {
			if (err) {
				res.send("Error while reading directory " + adminRoot, 404);
			} else {
				var reports = [];
				files.forEach(function (file) {
					var time = parseInt(file.substring(file.lastIndexOf("_") + 1, file.lastIndexOf(".json")), 10);
					reports.push({
						id : file,
						time : time,
						date : (new Date(time)).toString()
					});
				});
				reports.sort(function (first, second) {
					var timeOne = first.time;
					var timeTwo = second.time;
					if (timeOne == timeTwo) {
						// rly ?
						return 0;
					}
					return timeOne < timeTwo ? 1 : -1;
				});
				if (req.param("callback", false)) {
					res.json(reports);
				} else {
					res.render("admin", {
						reports : reports,
						conf : {
							htdoc : docRoot,
							report : adminRoot
						}
					});
				}
			}
		});
	});

	app.get("/r/:report", function (req, res) {
		readReport(req.params.report, sendReport.bind(this, req, res));
	});

	app.get("/r/:report/sort/:what/:how", function (req, res) {
		readReport(req.params.report, sendReport.bind(this, req, res));
	});

	app.get("/r/:report/file/:fileName", function (req, res) {
		var fileName = req.params.fileName;
		readReport(req.params.report, function (err, data) {
			if (err) {
				res.send(500);
			} else {
				if (req.param("callback", false)) {
					res.json(data.files[fileName]);
				} else {
					res.render("file", {
						name : req.params.report,
						file : fileName,
						report : data.files[fileName]
					});
				}
			}
		});
	});

	app.get("/fn/:report", function (req, res) {
		readReport(req.params.report, function (err, data) {
			if (err) {
				res.send(500);
			} else {
				if (req.param("callback", false)) {
					res.json(data);
				} else {
					res.render("stack", {
						name : req.params.report,
						report : data
					});
				}
			}
		});
	});

	app.get("/merge", function (req, res) {
		var toBeMerged = req.param("report");
		readMultipleReports(toBeMerged, function (err, reports) {
			if (err) {
				res.send(404);
			} else {
				var mergedReport = report.mergeReports(reports);

				if (req.param("callback", false)) {
					res.json(mergedReport);
				} else {
					var shorterNames = toBeMerged.map(function (name) {
						return name.substring(0, name.lastIndexOf(".json"));
					});
					var reportName = common.createReportName("merge_" + shorterNames.join("_"));
					var fileName = adminRoot + "/" + reportName;

					console.log("Saving merged report", fileName);
					fs.writeFile(fileName, JSON.stringify(mergedReport), "utf-8", function (err) {
						if (err) {
							msg = "Error while saving coverage report to " + fileName;
							console.error(msg, err);
							res.send(msg, 500);
						} else {
							res.redirect("/r/" + reportName);
						}
					});
				}
			}
		});
	});

	app.get("/stat/:report", function (req, res) {
		readReport(req.params.report, function (err, data) {
			if (err) {
				res.send(500);
			} else {
				var stats = report.stats(data);
				if (req.param("callback", false)) {
					res.json(stats);
				} else {
					res.render("stats", {
						name : req.params.report,
						report : stats
					});
				}
			}
		});
	});

	app.listen(adminPort);

	function readReport (report, callback) {
		fs.readFile(adminRoot + "/" + report, function (err, data) {
			if (err) {
				console.error(err);
				callback.call(null, err);
			} else {
				try {
					var result = JSON.parse(data);
					callback.call(null, false, result);
				} catch (ex) {
					console.error(ex);
					callback.call(null, ex);
				}
			}
		});
	};

	function sendReport(req, res, err, report, name) {
		if (err) {
			res.send(500);
		} else {
			var what = req.params.what || "file";
			var how = req.params.how || "desc";

			if (req.param("callback", false)) {
				res.json(sortReport(report, what, how));
			} else {
				res.render("report", {
					name : name || req.params.report,
					report : sortReport(report, what, how),
					sort : {
						what : what,
						how : how
					}
				});
			}
		}
	};

	function readMultipleReports (reports, callback) {
		var howMany = reports.length;
		var result = [];
		if (howMany == 0) {
			return callback.call(this, "No reports to read");
		}
		reports.forEach(function (report) {
			readReport(report, function (err, data) {
				if (err) {
					callback.call(this, err);
				} else {
					result.push(data);
					howMany -= 1;
					if (howMany < 1) {
						callback.call(this, null, result);
					}
				}
			});
		});
	}
};


function sortReport (reports, what, how) {
	var howToSort;
	var fileReports = [];
	for (var file in reports.files) {
		if (reports.files.hasOwnProperty(file)) {
			fileReports.push({
				file : file,
				report : reports.files[file]
			});
		}
	}

	var numericalSort = function (attribute, direction) {
		return function (first, second) {
			var firstValue = first.report[attribute].percentage;
			var secondValue = second.report[attribute].percentage;
			if (firstValue == secondValue) {
				return 0;
			}
			var compare = (firstValue > secondValue) ? 1 : -1;
			return direction == "asc" ? compare : -compare;
		};
	};

	if (what == "statement") {
		howToSort = numericalSort("statements", how);
	} else if (what == "condition") {
		howToSort = numericalSort("conditions", how);
	} else if (what == "function") {
		howToSort = numericalSort("functions", how);
	} else {
		// file sort, not a numerical sort
		howToSort = function (first, second) {
			var firstValue = first.file;
			var secondValue = second.file;
			if (firstValue == secondValue) {
				return 0;
			}
			var compare = firstValue.localeCompare(secondValue);
			return how == "asc" ? -compare : compare;
		};
	}

	return {
		global : reports.global,
		files : fileReports.sort(howToSort)
	};
};