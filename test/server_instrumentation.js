// This test verifies that the instrumentation server works as expected

var maxAttempts = 5;

var server = require("../lib/server/instrumentation");
var path = require("path");
var utils = require("./helpers/utils");
var http = require("http");
var storage = require("../lib/storage");

exports.memory = function (test) {
	// All the stuff here is just to send a request
	test.expect(24);

	var report = {};

	var options = {
		"storage" : {
			save : function (name, content, callback) {
				report.name = name;
				report.content = JSON.parse(content);
				callback(null);
			},
			read : function () {}
		},
		"function" : true,
		"condition" : true,
		"doHighlight" : true
	};

	utils.getPort(maxAttempts, function (error, port) {
		test.ifError(error);

		var reportPath = path.join(__dirname, "tmp");

		var instance = server.start(__dirname, port, reportPath, port + 1, options);
		instance.on("listening", function () {
			var fileName = "/server/random.js";

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
						if (killMe) {
							clearTimeout(killMe);
						}
						test.done();
						instance = null;
					})
				});
			});
		});

		// Just in case something wrong happens and the server doesn't close by itself
		var killMe = setTimeout(function () {
			if (instance) {
				instance.close();
			}
		}, 1000);
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