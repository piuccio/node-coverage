var helpers = require("./helpers/utils");
var fileSystem = require("../lib/fileSystem");
var report = require("../lib/report");
var instrument = require("../lib/instrument");

var unusedLines = 21;
var byFile = {
	'test/stats/top.js': 2,

	'test/stats/one/first.js': 3,
	'test/stats/one/sub/second.js': 0,
    
    'test/stats/two/base.js': 5,
    'test/stats/two/first/sub.js': 6,
    'test/stats/two/second/third/leaf.js': 3,
    'test/stats/two/second/third/branch.js': 2
};
var byPackage = {
	0 : {
		'test' : unusedLines
	},
	1 : {
		'test/stats' : unusedLines
	},
	2 : {
		'test/stats/top.js': 2,
		'test/stats/one' : 3,
		'test/stats/two' : 16
	},
	3 : {
		'test/stats/top.js': 2,
		'test/stats/one/first.js': 3,
		'test/stats/one/sub': 0,
	    'test/stats/two/base.js': 5,
	    'test/stats/two/first': 6,
	    'test/stats/two/second': 5
	},
	4 : {
		'test/stats/top.js': 2,
		'test/stats/one/first.js': 3,
		'test/stats/one/sub/second.js': 0,
	    'test/stats/two/base.js': 5,
	    'test/stats/two/first/sub.js': 6,
	    'test/stats/two/second/third': 5
	},
	5 : byFile
};

exports.stats = function (test) {
	test.expect(8);

	var allReports = [];

	fileSystem.perform("test/stats/**", function (error, file, code) {
		if (error) {
			test.ifError(error);
		}
		var instrumented = instrument(file, code).clientCode;

		allReports.push(helpers.executeCode(file, instrumented));		
	}).then(function () {
		var merged = report.mergeReports(allReports);

		var statistics = report.stats(merged);

		test.equal(statistics.unused, unusedLines, "Total unused lines");
		test.ok(helpers.objectEquals(statistics.byFile, byFile), "Group by file");

		for (var length in statistics.byPackage) {
			test.ok(helpers.objectEquals(
				statistics.byPackage[length], byPackage[length]), "Group by package, depth " + length);
		}

		test.done();
	}, function (error) {
		test.ifError(error);
		test.ok(false, "Perform action failed");
		test.done();
	});
};