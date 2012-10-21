var helpers = require("./helpers/utils");

exports.fromVariables = function (test) {
	test.expect(1);

	helpers.run("test/names/variables.js", function (test, file, code, report) {
		var expected = {
			"(?)" : 1,
			"glob" : 1,
			"name" : 1,
			"first" : 1,
			"second" : 1,
			"thisHasAName" : 1,
			"nested" : 1,
			"inner" : 2
		};

		var functions = Object.keys(report.files["test/names/variables.js"].functions.detail);
		var got = helpers.clusterFunctions(functions);

		test.ok(helpers.objectEquals(expected, got), "Functions don't match");
	}, test);
};


exports.fromObjects = function (test) {
	test.expect(1);

	helpers.run("test/names/objects.js", function (test, file, code, report) {
		var expected = {
			"withName" : 1,
			"first" : 1,
			"second" : 1,
			"th:ird" : 1,
			"assigned" : 1,
			"b" : 1
		};

		var functions = Object.keys(report.files["test/names/objects.js"].functions.detail);
		var got = helpers.clusterFunctions(functions);

		test.ok(helpers.objectEquals(expected, got), "Functions don't match");
	}, test);
};

exports.ternary = function (test) {
	test.expect(1);

	helpers.run("test/names/ternary.js", function (test, file, code, report) {
		var expected = {
			"outside" : 2,
			"inside" : 1,
			"one" : 1,
			"property" : 2,
			"another" : 1,
			"two" : 1
		};

		var functions = Object.keys(report.files["test/names/ternary.js"].functions.detail);
		var got = helpers.clusterFunctions(functions);

		test.ok(helpers.objectEquals(expected, got), "Functions don't match");
	}, test);
};