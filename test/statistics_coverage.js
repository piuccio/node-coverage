var helpers = require("./helpers/utils");
var fileSystem = require("../lib/fileSystem");
var report = require("../lib/report");
var instrument = require("../lib/instrument");

var byPackage = {
	0 : {
		'/test' : 21 / 42
	},
	1 : {
		'/test/stats' : 21 / 42
	},
	2 : {
		'/test/stats/top.js': 4 / 6,
		'/test/stats/one' : 6 / 9,
		'/test/stats/two' : 11 / 27
	},
	3 : {
		'/test/stats/top.js': 4 / 6,
		'/test/stats/one/first.js': 3 / 6,
		'/test/stats/one/sub': 3 / 3,
		'/test/stats/two/base.js': 2 / 7,
		'/test/stats/two/first': 2 / 8,
		'/test/stats/two/second': 7 / 12
	},
	4 : {
		'/test/stats/top.js': 4 / 6,
		'/test/stats/one/first.js': 3 / 6,
		'/test/stats/one/sub/second.js': 3 / 3,
		'/test/stats/two/base.js': 2 / 7,
		'/test/stats/two/first/sub.js': 2 / 8,
		'/test/stats/two/second/third': 7 / 12
	},
	5 : {
		'/test/stats/top.js': 4 / 6,

		'/test/stats/one/first.js': 3 / 6,
		'/test/stats/one/sub/second.js': 3 / 3,

		'/test/stats/two/base.js': 2 / 7,
		'/test/stats/two/first/sub.js': 2 / 8,
		'/test/stats/two/second/third/leaf.js': 3 / 6,
		'/test/stats/two/second/third/branch.js': 4 / 6
	}
};

exports.coverage = function (test) {
	test.expect(6);

	var allReports = [];

	fileSystem.perform("test/stats/**", function (error, file, code) {
		if (error) {
			test.ifError(error);
		}
		var instrumented = instrument(file, code).clientCode;

		allReports.push(helpers.executeCode(file, instrumented));
	}).then(function () {
		var merged = report.mergeReports(allReports);

		report.stats(merged, function (statistics) {
			assertCoverageStatistics(test, statistics.coverage.statements);

			test.done();
		});
	}, function (error) {
		test.ifError(error);
		test.ok(false, "Perform action failed");
		test.done();
	});
};

function assertCoverageStatistics (test, statistics) {
	for (var length in statistics) {
		test.deepEqual(statistics[length], byPackage[length], "Group by package, depth " + length);
	}
}