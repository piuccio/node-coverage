// Check that the code is handled correctly inside reports
// It evaluates the code from a file, sends it to the server
// and checks how the code is stored in the report

var utils = require("./helpers/utils");
var admin = require("../lib/server/administration");
var instr = require("../lib/server/instrumentation");
var path = require("path");
var storage = require("../lib/storage");
var fs = require("fs");
var fileUtil = require("../lib/file");

exports.display = function (test) {
	test.expect(7);

	var serverOptions = {
		docRoot : path.join(__dirname, "/highlight"),
		adminRoot : path.join(__dirname, "/tmp/code"),
		coverageOptions : {
			"storage" : "memory",
			"condition" : true,
			"function" : true
		}
	};
	var fileName = "/log.js";

	utils.startServer(instr, serverOptions, function (error, port, useless, instrumentServer) {
		test.ifError(error);

		utils.startServer(admin, serverOptions, function (error, useless, adminPort, adminServer) {
			test.ifError(error);

			utils.getFile(fileName, port, function (error, file) {
				test.ifError(error);

				utils.executeCode(fileName, file, {
					XMLHttpRequest : utils.xhr(port, function (error) {
						test.ifError(error);

						storage(serverOptions.coverageOptions).keys(serverOptions.adminRoot, function (error, reports) {
							test.ifError(error);

							var reportName = path.basename(reports[0]);

							utils.getFile("/json/report/" + reportName, adminPort, function (error, report) {
								test.ifError(error);

								var code = JSON.parse(report).files["/log.js"].highlight;

								var expected = fs.readFileSync(path.join(__dirname, "/highlight/expected.js"));
								expected = fileUtil.normalizeNewLines(expected.toString());
								test.equal(code, expected, "Comparing highlighted code");

								instrumentServer.close();
								adminServer.close();
								test.done();
							});
						});
					})
				});
			});
		});
	});
};
