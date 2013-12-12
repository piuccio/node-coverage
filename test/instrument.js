/**
 * Verify that instrument correctly ignore already instrumented files
 * or the ones that should be ignored
 */

var instrument = require("../lib/instrument.js");
var clientCode = require("../lib/clientCode.js");
var file = require("../lib/file.js");

exports.alreadyInstrumented = function (test) {
	test.expect(2);

	var code = file.markInstrumented("var one = 2;");
	var result = instrument("file.js", code);

	test.equals(result.clientCode, result.clientCode);
	test.ok(!result.error, "Code should not be in error");

	test.done();
};

exports.ignored = function (test) {
	test.expect(2);

	var code = "var two = 1;";
	var result = instrument("file.js", code, {
		ignore : "file.js"
	});

	test.equals(result.clientCode, file.markInstrumented(code));
	test.ok(!result.error, "Code should not be in error");

	test.done();
};

exports.ignoredArray = function (test) {
	test.expect(2);

	var code = "var two = 1;";
	var result = instrument("file.js", code, {
		ignore : ["another.js", "file.js"]
	});

	test.equals(result.clientCode, file.markInstrumented(code));
	test.ok(!result.error, "Code should not be in error");

	test.done();
};

exports.unkownFile = function (test) {
	test.expect(2);

	var code = "var three = 4;";
	var result = instrument("file.unknown", code, {
		ignore : "file.js"
	});

	test.equals(result.clientCode, code);
	test.ok(!result.error, "Code should not be in error");

	test.done();
};

exports.parseError = function (test) {
	test.expect(2);

	var code = ";3 =! four var";
	var result = instrument("file.js", code);

	test.equals(result.clientCode, code);
	test.ok(result.error, "Code should be in error");

	test.done();
};

exports.hasHeader = function (test) {
	test.expect(2);

	var code = "var five = 5;";
	var result = instrument("file.js", code);

	test.ok(file.isInstrumented(result.clientCode));
	test.ok(!code.error, "Code should not be in error");

	test.done();
};