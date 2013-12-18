var highlight = require("../lib/highlight");
var path = require("path");
var fs = require("fs");
var helpers = require("./helpers/utils");
var fileUtil = require("../lib/file");

exports.format = function (test) {
	test.expect(1);

	helpers.run(path.join(__dirname, "/highlight/log.js"), function (test, file, code, report) {
		var high = highlight(report.files[file]);

		var expected = fs.readFileSync(path.join(__dirname, "/highlight/expected.js"));
		expected = fileUtil.normalizeNewLines(expected.toString());

		test.equal(high, expected, "Highlighted code");
	}, test);
}
