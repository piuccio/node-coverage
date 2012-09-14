var helpers = require("./helpers/utils");
var instrument = require("../lib/instrument");
var report = require("../lib/report");

exports.quote = function (test) {
	test.expect(2);
	
	// This filename contains weird symbols
	var fileName = "a\\té.js";
	
	var code = instrument(fileName, "var a = function () { if (true) {}};", {
		"function" : true,
		"condition" : true,
		"highlight" : true
	}).clientCode;
	
	var result = helpers.executeCode(fileName, code);
	
	// I expect to find it in the result
	test.ok(!!result.files[fileName]);
	
	test.equals(50, result.files[fileName].statements.percentage);
	
	test.done();
};