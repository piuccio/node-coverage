var stats = require("../lib/statistics");

exports.packages = function (test) {
	test.expect(1);

	var files = [
		"a/here",
		"a/b/one",
		"a/b/two",
		"/a/b/three",
		"/a/c/other",
		"/b"
	];

	var expect = {
		"0" : {
			"/a" : ["a/here", "a/b/one", "a/b/two", "/a/b/three", "/a/c/other"],
			"/b" : ["/b"]
		},
		"1" : {
			"/a/here" : ["a/here"],
			"/a/b" : ["a/b/one", "a/b/two", "/a/b/three"],
			"/a/c" : ["/a/c/other"],
			"/b" : ["/b"]
		},
		"2" : {
			"/a/here" : ["a/here"],
			"/a/b/one" : ["a/b/one"],
			"/a/b/two" : ["a/b/two"],
			"/a/b/three" : ["/a/b/three"],
			"/a/c/other" : ["/a/c/other"],
			"/b" : ["/b"]
		}
	};

	var got = stats.generatePackages(files);
	test.deepEqual(got, expect);

	test.done();
}