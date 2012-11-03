var server = require("../lib/server/administration");
var path = require("path");
var utils = require("./helpers/utils");
var http = require("http");
var storage = require("../lib/storage");

var app = null;
var killer = null;
var port = 0;
var reportPath = path.join(__dirname, "administration");
var options = {
	"storage" : "disk",
	"function" : true,
	"condition" : true,
	"doHighlight" : true
};

exports.access = {
	setUp : function (cb) {
		startServer(cb);
	},

	tearDown : function (cb) {
		endServer(cb);
	},

	listReports : function (test) {
		test.expect(3);
		test.ok(!!app, "Missing server");

		utils.getFile("/", port, function (error, content) {
			test.ifError(error);

			test.ok(content.indexOf("Aria.loadTemplate") > -1, "Couldn't find Aria Templates in the index file");

			test.done();
		});
	},

	reportsDetails : function (test) {
		test.expect(3);
		test.ok(!!app, "Missing server");

		utils.getFile("/report", port, function (error, content) {
			test.ifError(error);

			test.ok(content.indexOf("Aria.loadTemplate") > -1, "Couldn't find Aria Templates in the index file");

			test.done();
		});
	}
};

exports.json = {
	setUp : function (cb) {
		startServer(cb);
	},

	tearDown : function (cb) {
		endServer(cb);
	},

	listReports : function (test) {
		test.expect(9);
		test.ok(!!app, "Missing server");

		utils.getFile("/json/all", port, function (error, content) {
			test.ifError(error);

			var json = JSON.parse(content);

			test.deepEqual(json.conf.options, options, "Options seems to be wrong");
			test.equal(json.conf.reportFolder, reportPath);
			test.equal(json.conf.documentRoot, __dirname);

			var reports = json.reports;
			test.equal(reports.length, 3, "Expecting 3 reports, got " + reports.length);

			expecting = [{
				name : "cool",
				id : "cool_1324576890.json",
				time : 1324576890,
				date : new Date(1324576890).toString()
			}, {
				name : "otherreport",
				id : "otherreport_1234509876.json",
				time : 1234509876,
				date : new Date(1234509876).toString()
			}, {
				name : "report",
				id : "report_1234567890.json",
				time : 1234567890,
				date : new Date(1234567890).toString()
			}];

			expecting.forEach(function (wanted) {

				var found = false;
				reports.forEach(function (got) {
					if (!found) {
						var allEquals = true;
						Object.keys(wanted).forEach(function (key) {
							if (wanted[key] !== got[key]) {
								allEquals = false;
							}
						});
						if (allEquals) {
							found = true;
						}
					}
				});

				test.ok(found, "Couldn't find report " + wanted.name);
			});

			test.done();
		});
	},

	reportsDetails : function (test) {
		test.expect(6);
		test.ok(!!app, "Missing server");

		utils.getFile("/json/report/report_1234567890.json", port, function (error, content) {
			test.ifError(error);

			var json = JSON.parse(content);

			test.equal(json.files.one.statements.percentage, 100, "Invalid JSON");

			//by default it should be sorted by filename
			var expected = [
				"one", 
				"three", 
				"two"
			];
			test.deepEqual(json.sort.files, expected, "Not in the correct order");
			test.equal(json.sort.by, "id", "Files should be sorted by id, got " + json.sort.by);
			test.equal(json.sort.direction, "ASC", "Files should be sorted ASC, got " + json.sort.direction);

			test.done();
		});
	},

	missingAction : function (test) {
		test.expect(2);
		test.ok(!!app, "Missing server");

		utils.getFile("/json/whatever", port, function (error, content) {
			test.ok(!!error, "There should be an error performing wathever action");

			test.done();
		});
	}
};

exports.sort = {
	setUp : function (cb) {
		startServer(cb);
	},

	tearDown : function (cb) {
		endServer(cb);
	},

	id : function (test) {
		var expected = [
			"one",
			"three",
			"two"
		];

		testSorted(test, "id", expected);
	},

	statements : function (test) {
		var expected = [
			"one",
			"two",
			"three"
		];

		testSorted(test, "statements", expected);
	},

	conditions : function (test) {
		var expected = [
			"two",
			"one",
			"three"
		];

		testSorted(test, "conditions", expected);
	},

	functions : function (test) {
		var expected = [
			"three",
			"one",
			"two"
		];

		testSorted(test, "functions", expected);
	}
};

exports.statics = {
	setUp : function (cb) {
		startServer(cb);
	},

	tearDown : function (cb) {
		endServer(cb);
	},

	views : function (test) {
		test.expect(1);

		utils.getFile("/views/Layout.tpl", port, function (error, content) {
			test.ifError(error);

			test.done();
		});
	},

	aria_templates : function (test) {
		test.expect(1);

		utils.getFile("/aria-templates/aria/bootstrap.js", port, function (error, content) {
			test.ifError(error);

			test.done();
		});
	}
};


function startServer (callback) {
	utils.getPort(5, function (error, randomPort) {
		if (error) {
			app = null;
			callback();
		} else {
			port = randomPort;

			var instance = server.start(__dirname, port + 1, reportPath, port, options);
			instance.on("listening", function () {
				app = instance;
				callback();
			});

			killer = setTimeout(function () {
				if (instance) {
					instance.close();
					app = null
				}
			}, 1000);
		}
	});
}

function endServer (callback) {
	if (app) {
		clearTimeout(killer);
		killer = null;
		app.close();
		app = null;
	}
	callback();
}

function testSorted (test, key, expected) {
	// expected ASC

	test.expect(8);

	utils.getFile("/json/report/report_1234567890.json/sort/" + key + "/ASC", port, function (error, content) {
		test.ifError(error);

		var got = JSON.parse(content).sort;

		test.deepEqual(got.files, expected, "Not in the correct order");
		test.equal(got.by, key, "Files should be sorted by " + key + ", got " + got.by);
		test.equal(got.direction, "ASC", "Files should be sorted ASC, got " + got.direction);

		// Now do it DESC
		utils.getFile("/json/report/report_1234567890.json/sort/" + key + "/DESC", port, function (error, content) {
			test.ifError(error);

			var got = JSON.parse(content).sort;

			test.deepEqual(got.files, expected.reverse(), "Not in the correct order");
			test.equal(got.by, key, "Files should be sorted by " + key + ", got " + got.by);
			test.equal(got.direction, "DESC", "Files should be sorted DESC, got " + got.direction);

			test.done();
		});
	});
}