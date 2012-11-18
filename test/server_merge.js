// We know that the merge works, we just want to test that 
// it does even when using the server
var server = require("../lib/server/administration");
var instrument = require("../lib/server/instrumentation");
var path = require("path");
var utils = require("./helpers/utils");
var http = require("http");
var storage = require("../lib/storage")({storage : "memory"});

var expectedCoverage = require("./results/reports").results;
var expectedDetails = require("./results/details").results;

reportNames = [];
var options = {
	docRoot : path.join(__dirname, "/reports"),
	adminRoot : path.join(__dirname, "tmp"),
	coverageOptions : {
		"storage" : {
			save : function (name, report, callback) {
				reportNames.push(path.basename(name));
				storage.save.apply(this, arguments);
				callback();
			},
			read : function () {
				storage.read.apply(this, arguments);
			},
			keys : function () {
				storage.keys.apply(this, arguments);
			}
		},
		"function" : true,
		"condition" : true,
		"doHighlight" : true
	}
};

exports.merge = function (test) {
	test.expect(4 + 2 * (10 + 9) + 10);

	utils.startServer(instrument, options, function (error, port, _, instanceInstrument) {
		utils.startServer(server, options, function (error, _, adminPort, instanceAdmin) {
			get("/file1.js", port, function () {
				get("/file2.js", port, function () {
					test.equal(reportNames.length, 2, "Expecting 2 reports");
					
					post("/merge", adminPort, reportNames, function (error, data) {
						test.ifError(error);
						test.equal(data.indexOf("report_report"), 0, "Report name should start with report_report");

						// data now contains the new report, I can try to get it
						utils.getFile("/json/report/" + data, adminPort, function (error, textReport) {
							report = JSON.parse(textReport);

							test.equal(data, report.name, "Merged report has no name");

							for (var fileName in report.files) {
								var shortFileName = utils.shortName(fileName);

								utils.assertCoverageEquals(report.files[fileName], expectedCoverage[shortFileName], shortFileName, test);
								utils.assertDetailsEquals(report.files[fileName], expectedDetails.merge[shortFileName], shortFileName, test);
							}

							utils.assertCoverageEquals(report.global, expectedCoverage["merge_1_2"], "merge_1_2", test);


							instanceInstrument.close();
							instanceAdmin.close();
							test.done();
						});
					});
				});
			});
		});
	});
};

function get (file, port, callback) {
	utils.getFile(file, port, function (error, content) {
		utils.executeCode(file, content, {
			XMLHttpRequest : utils.xhr(port, function (error) {
				callback();
			})
		});
	});
}

function post (url, port, data, callback) {
	var req = http.request({
		port : port,
		path : url,
		method : "POST",
		headers : {
			"Content-Type" : "application/json"
		}
	}, function (res) {
		if (res.statusCode === 200) {
			var buffer = "";

			res.setEncoding("utf8");
			res.on("data", function (chunk) {
			    buffer += chunk;
			}).on("end", function () {
				callback(null, buffer);
			});
		} else {
			callback(new Error("Response status : " + res.statusCode));
		}
	});

	req.on("error", function (error) {
		callback(error);
	});

	req.write(JSON.stringify(data));
	req.end();
}