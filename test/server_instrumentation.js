// This test verifies that the instrumentation server works as expected

var maxAttempts = 5;

var server = require("../lib/server/instrumentation");
var path = require("path");
var utils = require("./helpers/utils");
var http = require("http");
var storage = require("../lib/storage");
var fs = require("fs");

function optionsGetter () {
	var report = {};

	var options = {
		"storage": {
			save : function (name, content, callback) {
				report.name = name;
				report.content = JSON.parse(content);
				callback(null);
			},
			read : function () {},
			keys : function () {}
		},
		"function": true,
		"condition": true
	};
	var serverOptions = {
		docRoot : __dirname,
		adminRoot : path.join(__dirname, "tmp"),
		coverageOptions : options
	};

	var getOptions = function () {
		return serverOptions;
	};
	getOptions.getReport = function () {
		return report;
	};

	return getOptions;
}

exports.memory = function (test) {
	// All the stuff here is just to send a request
	test.expect(4 + 2 * 10);

	var fileName = "/server/random.js";
	var getOptions = optionsGetter();

	utils.startServer(server, getOptions(), function (error, port, useless, instance) {
		test.ifError(error);

		utils.getFile(fileName, port, function (errInGet, file) {
			test.ifError(errInGet);

			utils.executeCode(fileName, file, {
				XMLHttpRequest : utils.xhr(port, function (errInXhr) {
					test.ifError(errInXhr);
					var report = getOptions.getReport();

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

exports.formSubmit = function (test) {
	var fileName = "/server/random.js";

	var fileName = "/server/random.js";
	var getOptions = optionsGetter();

	utils.startServer(server, getOptions(), function (error, port, useless, instance) {
		test.ifError(error);

		utils.getFile(fileName, port, function (errInGet, file) {
			test.ifError(errInGet);

			// Inject the logic for a form submit
			file += "$$_l.__send=function(report){window.please_echo(report)};";
			utils.executeCode(fileName, file, {
				please_echo: function (reportAsString) {
					utils.httpAction({
						port : port,
						path : "/node-coverage-store",
						method : "POST",
						headers : {
							"Content-Type" : "application/x-www-form-urlencoded"
						}
					}, function (errorInEcho) {
						test.ifError(errorInEcho);

						var report = getOptions.getReport();
						test.ok(/^form_submit_[0-9]+\.json$/.exec(path.basename(report.name)), "Invalid report name");

						var check = report.content;

						utils.assertCoverageEquals(check.files[fileName], expected, fileName, test);
						utils.assertCoverageEquals(check.global, expected, fileName, test);

						instance.close();
						test.done();
					})("coverage=" + reportAsString);
				}
			}, "form_submit");
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