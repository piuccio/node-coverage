var fs = require("../lib/fileSystem");

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

	fs.getInterpreter("a", "b", interpreters).interpret();
	test.ok(whatWasCalled.all, "all : a");
	test.ok(!whatWasCalled.js, "js : a");
	test.ok(!whatWasCalled.content, "content : a");
	test.ok(!whatWasCalled.tpl, "tpl : a");


	whatWasCalled = generateExpectedObjectStructure();
	fs.getInterpreter("file.js", "content", interpreters).interpret();
	test.ok(!whatWasCalled.all, "all : a");
	test.ok(whatWasCalled.js, "js : a");
	test.ok(!whatWasCalled.content, "content : a");
	test.ok(!whatWasCalled.tpl, "tpl : a");

	whatWasCalled = generateExpectedObjectStructure();
	fs.getInterpreter("file.js", "content contains myCoolFramework", interpreters).interpret();
	test.ok(!whatWasCalled.all, "all : a");
	test.ok(!whatWasCalled.js, "js : a");
	test.ok(whatWasCalled.content, "content : a");
	test.ok(!whatWasCalled.tpl, "tpl : a");

	whatWasCalled = generateExpectedObjectStructure();
	fs.getInterpreter("file.tpl", "content contains myCoolFramework", interpreters).interpret();
	test.ok(!whatWasCalled.all, "all : a");
	test.ok(!whatWasCalled.js, "js : a");
	test.ok(!whatWasCalled.content, "content : a");
	test.ok(whatWasCalled.tpl, "tpl : a");

	test.done();
};