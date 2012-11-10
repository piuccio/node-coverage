var highlight = require("../lib/highlight");
var path = require("path");
var fs = require("fs");
var expected = require("./highlight/expected");
var js = require("../lib/interpreters/basic javascript");

exports.splitLines = function (test) {
	test.expect(1 + assertPerLine());

	var fileName = path.join(__dirname, "/highlight/log.js");

	fs.readFile(fileName, "utf-8", function (error, content) {
		var structure = js.interpret(fileName, content);

		var result = highlight(content, structure).original;

		var reconstructed = "";
		expected.forEach(function (line, number) {
			test.equal(line.node.length, result[number].length, "Nodes length differs on line " + number);

			line.node.forEach(function (type, position) {
				var msg = "Node in line " + number + " position " + position;

				if (type === "t") {
					test.ok(typeof result[number][position] === "string", msg);
					reconstructed += result[number][position];
				} else {
					test.equal(type, result[number][position].type, msg);
				}
			});
			if (number < expected.length - 1) {
				reconstructed += "\n";
			}
		});

		test.equal(reconstructed, content, "File differ from list of lines");

		test.done();
	});
}

function assertPerLine () {
	var asserts = 0;
	expected.forEach(function (line) {
		// One assert for node length
		asserts += 1;
		// One assert for each node
		asserts += line.node.length;
	});

	return asserts;
}

exports.simple = {
	startText : function (test) {
		var content = "//a\nvar a;\n";
		var expected = ["//a", "var a;"];
		simpleTest(test, content, expected, 2);
	},

	endText : function (test) {
		var content = "var a; //in\n";
		var expected = ["var a;", " //in"];
		simpleTest(test, content, expected, 1);
	},

	emptyLines : function (test) {
		var content = "var a;\n\n\nvar b;";
		var expected = ["var a;", "", "", "var b;"];
		simpleTest(test, content, expected, 4);
	},

	weirdLines : function (test) {
		var content = "\r\nvar a;\r\n\r\nvar b;\r\n";
		var expected = ["", "var a;", "", "var b;"];
		simpleTest(test, content, expected, 4);
	},

	textLastLine : function (test) {
		var content = "var a;\n   ";
		var expected = ["var a;", "   "];
		simpleTest(test, content, expected, 2);
	}
}

exports.conditions = {
	unary : function (test) {
		var content = "if(!!!true&&++1){}";
		var expected = ["!!!true", "++1"];
		extractConditions(test, content, expected);
	},

	binary : function (test) {
		var content = "if(a === 1){}";
		var expected = ["a === 1"];
		extractConditions(test, content, expected);
	},

	twoBinary : function (test) {
		var content = "if(a === 1 && b == 2){}";
		var expected = ["a === 1", "b == 2"];
		extractConditions(test, content, expected);
	},

	functions : function (test) {
		var content = "if((function(){})()&&typeof a === 'string'){}";
		var expected = ["(function(){})()", "typeof a === 'string'"];
		extractConditions(test, content, expected);
	},

	otherUnary : function (test) {
		var content = "if( void 0 &&  delete a.b){}";
		var expected = ["void 0", "delete a.b"];
		extractConditions(test, content, expected);
	},

	binaryAssignment : function (test) {
		var content = "b = a.returnValue === 1 ? K : J";
		var expected = ["a.returnValue === 1"];
		extractConditions(test, content, expected);
	},

	unaryAssignment : function (test) {
		var content = "b = !a.returnValue === 1 ? K : J";
		var expected = ["!a.returnValue === 1"];
		extractConditions(test, content, expected);
	}
}

exports.multinode = {
	statements : function (test) {
		var content = "var a=1;var b=2;\nvar c=3;var d=4";
		var expected = ["var a=1;", "var b=2;", "var c=3;", "var d=4"];
		simpleTest(test, content, expected, 2);
	}
}

function simpleTest(test, content, expected, lines) {
	test.expect(2);

	var structure = js.interpret("test", content);
	var result = highlight(content, structure).original;

	test.equal(result.length, lines, "Lines don't match");

	var tokens = [];
	result.forEach(function (line) {
		if (line.length) {
			line.forEach(function (node) {
				if (typeof node === "string") {
					tokens.push(node);
				}
			});
		} else {
			tokens.push("");
		}
	});
	test.deepEqual(tokens, expected, "Tokens don't match");

	test.done();
}

function extractConditions(test, content, expected) {
	test.expect(1);

	var structure = js.interpret("test", content);
	var result = highlight(content, structure).original;

	var tokens = [];
	var condition = "";
	var inCondition = false;
	result.forEach(function (line) {
		line.forEach(function (node) {
			if (typeof node === "string") {
				if (inCondition) {
					condition += node;
				}
			} else if (node.type === "cb") {
				inCondition = true;
				condition = "";
			} else if (node.type === "ce") {
				inCondition = false;
				tokens.push(condition);
			}
		});
	});
	test.deepEqual(tokens, expected, "Tokens don't match");

	test.done();
}