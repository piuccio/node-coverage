var instrument = require("../lib/instrument");

function generateExpectedObjectStructure () {
	return {
		all : false,
		js : false,
		content : false,
		tpl : false
	};
}

var whatWasCalled = generateExpectedObjectStructure();
var interpreters = [
	{
		filter : {
			files : /.*/
		},
		interpret : function () {
			whatWasCalled.all = true;
		}
	},
	{
		filter : {
			files : /\.js$/
		},
		interpret : function () {
			whatWasCalled.js = true;
		}
	},
	{
		filter : {
			files : /\.js$/,
			content : /myCoolFramework/
		},
		interpret : function () {
			whatWasCalled.content = true;
		}
	},
	{
		filter : {
			files : /\.tpl$/
		},
		interpret : function () {
			whatWasCalled.tpl = true;
		}
	}
];

exports.sort = function (test) {
	test.expect(16);

	instrument(interpreters, "a", "b");
	test.ok(whatWasCalled.all, "all : a");
	test.ok(!whatWasCalled.js, "js : a");
	test.ok(!whatWasCalled.content, "content : a");
	test.ok(!whatWasCalled.tpl, "tpl : a");


	whatWasCalled = generateExpectedObjectStructure();
	instrument(interpreters, "file.js", "content");
	test.ok(!whatWasCalled.all, "all : a");
	test.ok(whatWasCalled.js, "js : a");
	test.ok(!whatWasCalled.content, "content : a");
	test.ok(!whatWasCalled.tpl, "tpl : a");

	whatWasCalled = generateExpectedObjectStructure();
	instrument(interpreters, "file.js", "content contains myCoolFramework");
	test.ok(!whatWasCalled.all, "all : a");
	test.ok(!whatWasCalled.js, "js : a");
	test.ok(whatWasCalled.content, "content : a");
	test.ok(!whatWasCalled.tpl, "tpl : a");

	whatWasCalled = generateExpectedObjectStructure();
	instrument(interpreters, "file.tpl", "content contains myCoolFramework");
	test.ok(!whatWasCalled.all, "all : a");
	test.ok(!whatWasCalled.js, "js : a");
	test.ok(!whatWasCalled.content, "content : a");
	test.ok(whatWasCalled.tpl, "tpl : a");

	test.done();
};