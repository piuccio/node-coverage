var helpers = require("./helpers/utils");
var fileSystem = require("../lib/fileSystem");
var report = require("../lib/report");
var instrument = require("../lib/instrument");
var fileContent = require("../lib/fileContent");
var fileLib = require("../lib/file");
var path = require("path");

exports.size = function (test) {
	test.expect(3 * 5 + 3);

	var roughSize = {};
	var measuredSize = {};
	var waiting = 6;

	var allReports = [];

	function partial () {
		waiting -= 1;
		if (waiting === 0) {
			for (var file in measuredSize) {
				test.ok(measuredSize[file].original < measuredSize[file].originalMinify, "Gzip fullSize");
				test.ok(measuredSize[file].covered < measuredSize[file].coveredMinify, "Gzip coveredSize");
				test.ok(measuredSize[file].covered < measuredSize[file].original, "covered size on full size");
				test.ok(measuredSize[file].covered < roughSize[file], "covered size on rough size");
			}

			var merged = report.mergeReports(allReports);
			report.stats(merged, function (statistics) {
				var size = statistics.size;

				var expected_3 = {
					"/test/fileSize/index.js" : {
						covered : measuredSize["index.js"].covered,
						original : measuredSize["index.js"].original
					},
					"/test/fileSize/lib/faces.js" : {
						covered : measuredSize["faces.js"].covered,
						original : measuredSize["faces.js"].original
					},
					"/test/fileSize/lib/replacer.js" : {
						covered : measuredSize["replacer.js"].covered,
						original : measuredSize["replacer.js"].original
					}
				};

				test.deepEqual(expected_3, size["3"], "package 3");

				var expected_2 = {
					"/test/fileSize/index.js" : {
						covered : measuredSize["index.js"].covered,
						original : measuredSize["index.js"].original
					},
					"/test/fileSize/lib" : {
						covered : measuredSize["faces.js"].covered + measuredSize["replacer.js"].covered,
						original : measuredSize["faces.js"].original + measuredSize["replacer.js"].original
					}
				};

				test.deepEqual(expected_2, size["2"], "package 2");

				var expected_1 = {
					"/test/fileSize" : {
						covered : measuredSize["index.js"].covered + measuredSize["faces.js"].covered + measuredSize["replacer.js"].covered,
						original : measuredSize["index.js"].original + measuredSize["faces.js"].original + measuredSize["replacer.js"].original
					}
				};

				test.deepEqual(expected_1, size["1"], "package 1");

				test.done();
			});
		}
	}

	fileSystem.perform("test/fileSize_onlyCovered/**", function (error, file, code) {
		roughSize[path.basename(file)] = new Buffer(code).length;
	}).then(function () {
		fileSystem.perform("test/fileSize/**", function (error, file, code) {
			try {
				test.ifError(error);

				var shortFile = path.basename(file);

				measuredSize[shortFile] = {
					original : NaN,
					covered : NaN,
					originalMinify : NaN,
					coveredMinify : NaN
				};

				var instrumented = instrument(file, code).clientCode;
				var report = helpers.executeCode(file, instrumented);
				allReports.push(report);

				var code = fileContent.getFullFile(report.files[file]);
				var minify = fileContent.minify(code);
				measuredSize[shortFile].originalMinify = new Buffer(minify).length;
				fileContent.getFullSize(report.files[file], function (size) {
					measuredSize[shortFile].original = size;
					partial();
				});

				var coveredCode = fileContent.getCoveredFile(report.files[file]);
				var minify = fileContent.minify(coveredCode);
				measuredSize[shortFile].coveredMinify = new Buffer(minify).length;
				fileContent.getCoveredSize(report.files[file], function (size) {
					measuredSize[shortFile].covered = size;
					partial();
				});
			} catch (ex) {
				console.log(ex);
			}
		});
	});
};