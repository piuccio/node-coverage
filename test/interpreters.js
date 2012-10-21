var interpreters = require("../lib/interpreters");

function generateExpectedObjectStructure () {
	return {
		all : false,
		js : false,
		content : false,
		tpl : false
	};
}

var whatWasCalled = generateExpectedObjectStructure();
var list = [
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

	interpreters.getInterpreter("a", "b", list).interpret();
	test.ok(whatWasCalled.all, "all : a");
	test.ok(!whatWasCalled.js, "js : a");
	test.ok(!whatWasCalled.content, "content : a");
	test.ok(!whatWasCalled.tpl, "tpl : a");


	whatWasCalled = generateExpectedObjectStructure();
	interpreters.getInterpreter("file.js", "content", list).interpret();
	test.ok(!whatWasCalled.all, "all : a");
	test.ok(whatWasCalled.js, "js : a");
	test.ok(!whatWasCalled.content, "content : a");
	test.ok(!whatWasCalled.tpl, "tpl : a");

	whatWasCalled = generateExpectedObjectStructure();
	interpreters.getInterpreter("file.js", "content contains myCoolFramework", list).interpret();
	test.ok(!whatWasCalled.all, "all : a");
	test.ok(!whatWasCalled.js, "js : a");
	test.ok(whatWasCalled.content, "content : a");
	test.ok(!whatWasCalled.tpl, "tpl : a");

	whatWasCalled = generateExpectedObjectStructure();
	interpreters.getInterpreter("file.tpl", "content contains myCoolFramework", list).interpret();
	test.ok(!whatWasCalled.all, "all : a");
	test.ok(!whatWasCalled.js, "js : a");
	test.ok(!whatWasCalled.content, "content : a");
	test.ok(whatWasCalled.tpl, "tpl : a");

	test.done();
};