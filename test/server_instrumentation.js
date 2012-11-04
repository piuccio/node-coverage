// This test verifies that the instrumentation server works as expected

var maxAttempts = 5;

var server = require("../lib/server/instrumentation");
var path = require("path");
var utils = require("./helpers/utils");
var http = require("http");
var storage = require("../lib/storage");
var fs = require("fs");

exports.memory = function (test) {
	// All the stuff here is just to send a request
	test.expect(4 + 2 * 10);

	var report = {};

	var options = {
		"storage" : {
			save : function (name, content, callback) {
				report.name = name;
				report.content = JSON.parse(content);
				callback(null);
			},
			read : function () {},
			keys : function () {}
		},
		"function" : true,
		"condition" : true,
		"doHighlight" : true
	};
	var serverOptions = {
		docRoot : __dirname,
		adminRoot : path.join(__dirname, "tmp"),
		coverageOptions : options
	};

	var fileName = "/server/random.js";

	utils.startServer(server, serverOptions, function (error, port, useless, instance) {
		test.ifError(error);

		utils.getFile(fileName, port, function (errInGet, file) {
			test.ifError(errInGet);

			utils.executeCode(fileName, file, {
				XMLHttpRequest : utils.xhr(port, function (errInXhr) {
					test.ifError(errInXhr);

					test.ok(/^report_[0-9]+\.json$/.exec(path.basename(report.name)), "Invalid report name");

					var check = report.content;
					
					utils.assertCoverageEquals(check.files[fileName], expected, fileName, test);
					utils.assertCoverageEquals(check.global, expected, fileName, test);

					instance.close();
					test.done();
				})
			});
		});
	});
};

var expected = {
	total : 15,
	visited : 14,
	statementsPercentage : 100 * 14 / 15,
	conditions : 2,
	conditionsTrue : 1,
	conditionsFalse : 1,
	conditionsPercentage : 50,
	functions : 2,
	functionsCalled : 2,
	functionsPercentage : 100
};