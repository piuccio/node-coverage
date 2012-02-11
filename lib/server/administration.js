var express = require("express"), fs = require("fs"), path = require("path");

var report = require("../report");;
var instrument = require("../instrument");

exports.start = function (docRoot, port, adminRoot, adminPort) {
	var app = express.createServer();

	app.set('view engine', 'jade');
	app.set('view options', {
		layout: false
	});

	app.use(express.static(__dirname + "/../../views/statics"));

	app.get("/", function (req, res) {
		fs.readdir(adminRoot, function (err, files) {
			if (err) {
				res.send("Error while reading directory " + adminRoot, 404);
			} else {
				var reports = [];
				files.forEach(function (file) {
					var time = parseInt(file.substring(file.lastIndexOf("_") + 1, file.indexOf(".json")), 10);
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
				res.render("admin", {
					reports : reports,
					conf : {
						htdoc : docRoot,
						report : adminRoot
					}
				});
			}
		});
	});

	app.get("/r/:report", function (req, res) {
		readReport(req.params.report, function (err, report) {
			if (err) {
				res.send(500);
			} else {
				res.render("report", {
					name : req.params.report,
					report : sortReport(report, "file", "desc"),
					sort : {
						what : "file",
						how : "desc"
					}
				});
			}
		});
	});

	app.get("/r/:report/file/:fileName", function (req, res) {
		var fileName = req.params.fileName.replace(/\+/g, "/");
		readReport(req.params.report, function (err, report) {
			if (err) {
				res.send(500);
			} else {
				res.render("file", {
					name : req.params.report,
					file : fileName,
					report : report.files[fileName]
				});
			}
		});
	});

	app.get("/r/:report/sort/:what/:how", function (req, res) {
		readReport(req.params.report, function (err, report) {
			if (err) {
				res.send(500);
			} else {
				res.render("report", {
					name : req.params.report,
					report : sortReport(report, req.params.what, req.params.how),
					sort : {
						what : req.params.what,
						how : req.params.how
					}
				});
			}
		});
	});

	app.get("/fn/:report", function (req, res) {
		readReport(req.params.report, function (err, report) {
			if (err) {
				res.send(500);
			} else {
				res.render("stack", {
					name : req.params.report,
					report : report
				});
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
			var firstValue = first.report[attribute];
			var secondValue = second.report[attribute];
			if (firstValue == secondValue) {
				return 0;
			}
			var compare = (firstValue > secondValue) ? 1 : -1;
			return direction == "asc" ? compare : -compare;
		};
	};

	if (what == "statement") {
		howToSort = numericalSort("percentage", how);
	} else if (what == "condition") {
		howToSort = numericalSort("conditionsPercentage", how);
	} else if (what == "function") {
		howToSort = numericalSort("functionsPercentage", how);
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