// Check that the code is handled correctly inside reports
// It evaluates the code from a file, sends it to the server
// and checks how the code is stored in the report

var utils = require("./helpers/utils");
var admin = require("../lib/server/administration");
var instr = require("../lib/server/instrumentation");
var path = require("path");
var storage = require("../lib/storage");
var expected = require("./highlight/expected");

exports.display = function (test) {
	// log has 22 lines of code, 6 error assert
	test.expect(6 + assertPerLine());

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

								var code = JSON.parse(report).files["/log.js"].code;

								checkCode(test, code);

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

checkCode = function (test, code) {
	expected.forEach(function (line, number) {
		test.equal(line.node.length, code[number].length, "Nodes length differs on line " + number);

		line.node.forEach(function (type, position) {
			var msg = "Node in line " + number + " position " + position;

			if (type === "t") {
				test.ok(typeof code[number][position] === "string", msg);
			} else {
				test.equal(type, code[number][position].type, msg);
			}
		});
	});
}

function assertPerLine () {
	var asserts = 0;
	expected.forEach(function (line) {
		// One assert for node length
		asserts += 1;
		// One assert for each node
		asserts += line.node.length;
	});

	return asserts;
}