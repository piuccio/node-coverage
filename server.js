var instrument = require("./lib/instrument");
var report = require("./lib/report");
var fs = require("fs");
var util = require("util");
var argv = require("optimist")
	.usage("Start a simple web server to instrument JS code.")
	.options("d", {
		"alias" : "doc-root",
		"default" : "/var/www"
	}).describe("d", "Document Root. Content from this path will be served by the server")
	.options("r", {
		"alias" : "report-dir",
		"default" : "/var/log/node-coverage"
	}).describe("r", "Directory where reports are stored.")
	.options("p", {
		"alias" : "port",
		"default" : 8080
	}).describe("Web server port")
	.options("a", {
		"alias" : "admin-port",
		"default" : 8787
	}).describe("Admin server port")
	.boolean("h").alias("h", "help")
	.argv;

if (argv.h) {
	require("optimist").showHelp();
}

try {
	var stat = fs.statSync(argv.r);
	if (!stat.isDirectory()) {
		throw new Error(argv.r + " is not a directory");
	}
} catch (ex) {
	return console.error("Please specify a valid report directory", ex);
}


/* Instrumentation server */
var express = require("express");
var app = express.createServer();

app.use(express.bodyParser());


app.get(/\.js$/, function (req, res) {
	fs.readFile(argv.d + req.url, "utf-8", function (err, content) {
		if (err) {
			res.send("Error while reading " + req.url + err, 500);
		} else {
			var code = instrument.instrument(req.url, content);

			res.send(code, {"Content-Type" : "text/javascript"});
		}
	});
});

app.post("/node-coverage-store", function (req, res) {
	console.log("report received");
	var msg;
	try {
		var coverage = report.generateAll(req.body);
		var now = new Date();
		var fileName = [
			argv.r + "/report",
			now.getFullYear(), 
			now.getMonth() + 1,
			now.getDate(),
			now.getTime() + ".js"
		].join("_");
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

app.use(express.static(argv.d));

app.listen(argv.p);



/* Admin server */
var admin = express.createServer();

admin.set('view engine', 'jade');
admin.set('view options', {
	layout: false
});

admin.get("/", function (req, res) {
	fs.readdir(argv.r, function (err, files) {
		if (err) {
			res.send("Error while reading directory " + argv.r, 404);
		} else {
			var reports = [];
			files.forEach(function (file) {
				var time = parseInt(file.substring(file.lastIndexOf("_") + 1, file.indexOf(".js")), 10);
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
					htdoc : argv.d,
					report : argv.r
				}
			});
		}
	});
});

admin.get("/r/:report", function (req, res) {
	readReport(req.params.report, function (err, report) {
		if (err) {
			console.error(err);
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

admin.get("/r/:report/file/:fileName", function (req, res) {
	var fileName = req.params.fileName.replace(/\+/g, "/");
	readReport(req.params.report, function (err, report) {
		if (err) {
			console.error(err);
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

admin.get("/r/:report/sort/:what/:how", function (req, res) {
	readReport(req.params.report, function (err, report) {
		if (err) {
			console.error(err);
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

admin.get(/\.css$/, function (req, res) {
	res.sendfile(__dirname + "/views/stylesheets" + req.url);
});

admin.listen(argv.a);

function readReport (report, callback) {
	fs.readFile(argv.r + "/" + report, function (err, data) {
		if (err) {
			callback.call(null, err);
		} else {
			try {
				var result = JSON.parse(data);
				callback.call(null, false, result);
			} catch (ex) {
				callback.call(null, ex);
			}
		}
	});
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

	if (what == "statement") {
		howToSort = function (first, second) {
			var firstValue = first.report.percentage;
			var secondValue = second.report.percentage;
			if (firstValue == secondValue) {
				return 0;
			}
			var compare = (firstValue > secondValue) ? 1 : -1;
			return how == "asc" ? compare : -compare;
		};
	} else if (what == "condition") {
		howToSort = function (first, second) {
			var firstValue = first.report.conditionsPercentage;
			var secondValue = second.report.conditionsPercentage;
			if (firstValue == secondValue) {
				return 0;
			}
			var compare = (firstValue > secondValue) ? 1 : -1;
			return how == "asc" ? compare : -compare;
		};
	} else if (what == "function") {
		howToSort = function (first, second) {
			var firstValue = first.report.functionsPercentage;
			var secondValue = second.report.functionsPercentage;
			if (firstValue == secondValue) {
				return 0;
			}
			var compare = (firstValue > secondValue) ? 1 : -1;
			return how == "asc" ? compare : -compare;
		};
	} else {
		// file sort
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