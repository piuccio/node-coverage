var parser = require("uglify-js").parser;
var uglify = require("uglify-js").uglify;
var highlight = require("./highlight").highlight;

/**
 * Fist line of the generated file, it avoid instrumenting the same file twice
 */
var header = "//NODE-COVERAGE OFF\n";

/**
 * This is the main function of this module (it's the only one exported)
 * Given a file path and content returns the instrumented file
 * It won't instrument files starting with @see header
 */
var instrument = function (file, content) {
	if (content.indexOf(header) === 0) {
		return content;
	}

	try {
		var tree = parser.parse(content,false, true);
	} catch (ex) {
		console.error("Error instrumentig file", file, ex.message);
		return content;
	}

	var walker = uglify.ast_walker();
	// this is the list of nodes being analyzed by the walker
	// without this, w.walk(this) would re-enter the newly generated code with infinite recursion
	var analyzing = [];
	// list of all lines' id encounterd in this file
	var lines = [];
	// list of all conditions' id encounterd in this file
	var allConditions = [];
	// list of all functions' id encounterd in this file
	var allFunctions = [];

	/**
	 * A statement was found in the file, remember its id.
	 */
	function rememberStatement (id) {
		lines.push(id);
	};
	
	/**
	 * Generic function for counting a line.
	 * It generates a lineId from the line number and the block name (in minified files there
	 * are more logical lines on the same file line) and adds a function call before the actual
	 * line of code.
	 *
	 * 'this' is any node in the AST
	 */
	function countLine() {
		var ret;
		if (this[0].start && analyzing.indexOf(this) < 0) {
			var lineId = this[0].name + this[0].start.line;
			rememberStatement(lineId);

			analyzing.push(this);
			ret = [ "splice",
				[ 
					[ "stat",
						[ "call", [ "name", "$$_l" ],
							[
								[ "string", file ],
								[ "string", lineId]
							]
						]
					],
					walker.walk(this)
				]
			];
			analyzing.pop(this);
		}
		return ret;
	};

	/**
	 * Walker for 'if' nodes. It overrides countLine because we want to instrument conditions.
	 *
	 * 'this' is an if node, so
	 *    'this[0]' is the node descriptor
	 *    'this[1]' is the decision block
	 *    'this[2]' is the 'then' code block
	 *    'this[3]' is the 'else' code block
	 *
	 * Note that if/else if/else in AST are represented as nested if/else
	 */
	function countIf() {
		var self = this, ret;
		if (self[0].start && analyzing.indexOf(self) < 0) {
			var decision = self[1];
			var lineId = self[0].name + self[0].start.line;

			self[1] = wrapCondition(decision, lineId);

			// We are adding new lines, make sure code blocks are actual blocks
			if (self[2] && self[2][0].start && self[2][0].start.value != "{") {
				self[2] = [ "block", [self[2]]];
			}

			if (self[3] && self[3][0].start && self[3][0].start.value != "{") {
				self[3] = [ "block", [self[3]]];
			}
		}

		ret = countLine.call(self);

		if (decision) {
			analyzing.pop(decision);
		}

		return ret;
	};

	/**
	 * This is the key function for condition coverage as it wraps every condition in 
	 * a function call.
	 * The condition id is generated fron the lineId (@see countLine) plus the character
	 * position of the condition.
	 */
	function wrapCondition(decision, lineId, parentPos) {
		var pos = decision[0].start ? decision[0].start.pos : parentPos;
		if (isSingleCondition(decision)) {
			
			var condId = lineId + "_" + pos;

			analyzing.push(decision);
			allConditions.push(condId);
			return ["call",
				["name", "$$_c"],
				[
					[ "string", file ],
					[ "string", condId],
					decision
				]
			];
		} else {
			decision[2] = wrapCondition(decision[2], lineId, pos);
			decision[3] = wrapCondition(decision[3], lineId, pos);

			return decision;
		}
	};

	/**
	 * Wheter or not the if decision has only one boolean condition
	 */
	function isSingleCondition(decision) {
		if (decision[0].start && decision[0].name != "binary") {
			return true;
		} else if (decision[1] == "&&" || decision[1] == "||") {
			return false;
		} else {
			return true;
		}
	};

	/**
	 * Generic function for every node that needs to be wrapped in a block.
	 * For instance, the following code
	 *
	 *    for (a in b) doSomething(a)
	 *
	 * once converted in AST does not have a block but only a function call.
	 * Instrumentig this code would return
	 *
	 *    for (a in b) instrumentation()
	 *    doSomething(a)
	 *
	 * which clearly does not have the same behavior as the non instrumented code.
	 *
	 * This function generates a function that can be used by the walker to add 
	 * blocks when they are missing depending on where the block is supposed to be
	 */
	function wrapBlock(position) {
		return function countFor() {
			var self = this;

			if (self[0].start && analyzing.indexOf(self) < 0) {
				if (self[0].start && analyzing.indexOf(self) < 0) {
					if (self[position] && self[position][0].name != "block") {
						self[position] = [ "block", [self[position]]];
					}
				}
			}

			return countLine.call(self);
		};
	};

	/**
	 * Label nodes need special treatment as well.
	 *
	 *    myLabel : for (;;) {
	 *	     //whateveer code here
	 *       continue myLabel
	 *    }
	 *
	 * Label can be wrapped by countLine, hovewer the subsequent for shouldn't be wrapped.
	 *
	 *    instrumentation("label");
	 *    mylabel : instrumentation("for")
	 *       for (;;) {}
	 *
	 * The above code would be wrong.
	 *
	 * This function makes sure that the 'for' after a label is not instrumented and that
	 * the 'for' content is wrapped in a block.
	 *
	 * I'm don't think it's reasonable to use labels with something that is not a 'for' block.
	 * In that case the instrumented code might easily break.
	 */
	function countLabel() {
		var ret;
		if (this[0].start && analyzing.indexOf(this) < 0) {
			var content = this[2];

			if (content[0].name == "for" && content[4] && content[4].name != "block") {
				content[4] = [ "block", [content[4]]];
			}
			analyzing.push(content);

			var ret = countLine.call(this);

			analyzing.pop(content);
		}
		return ret;
	};

	/**
	 * Instrumenting function strictly needed for statement coverage only in case of 'defun'
	 * (function definition), however the block 'function' does not correspond to a new statement.
	 * This method allows to track every function call (function coverage). 
	 *
	 * As far as I can tell, 'function' is different from 'defun' for the fact that 'defun'
	 * refers to the global definition of a function
	 *    function something () {}    -> defun
	 *    something = function () {}  -> function
	 * 'function' doesn't need to be counted because the line is covered by 'name' or whatever
	 * other block.
	 *
	 * Strictly speaking full statement coverage does not imply function coverage only if there 
	 * are empty function, which however are empty!
	 *
	 * The tracking for functions is also a bit different from countLine (except 'defun'). This 
	 * method assigns every function a name and tracks the history of every call throughout the
	 * whole lifetime of the application, It's a sort of profiler.
	 *
	 *
	 * The structure of 'this' is
	 *    'this[0]' node descriptor
	 *    'this[1]' string, name of the function or null
	 *    'this[2]' array of arguments names (string)
	 *    'this[3]' block with the function's body
	 *
	 * As 'function' happens in the middle of a line, the instrumentation should be in the body.
	 */
	function countFunction () {
		var ret;
		if (this[0].start && analyzing.indexOf(this) < 0) {
			var defun = this[0].name === "defun";
			var lineId = this[0].name + this[0].start.line;
			var fnName = this[1] || "(?)";
			var body = this[3];
			
			analyzing.push(this);

			// put a new function call inside the body, works also on empty functions
			body.splice(0, 0, [ "stat",
				[ "call", 
					["name", "$$_f"],
					[
						["string", file],
						["string", fnName],
						["string", "" + this[0].start.line]
					]
				]
			]);
			// It would be great to instrument the 'exit' from a function
			// but it means tracking all return statements, maybe in the future...

			// Every function must be remember as 'function'
			allFunctions.push(fnName + this[0].start.line);
			
			if (defun) {
				// but only 'defun' should be remembered as statements
				rememberStatement(lineId);

				ret = [ "splice",
					[ 
						[ "stat",
							[ "call", [ "name", "$$_l" ],
								[
									[ "string", file],
									[ "string", lineId]
								]
							]
						],
						walker.walk(this)
					]
				];
			} else {
				ret = walker.walk(this);
			}

			analyzing.pop(this);

		}
		return ret;
	};

	var instrumentedTree = walker.with_walkers({
		"stat"     : countLine,
		"label"    : countLabel,
		"break"    : countLine,
		"continue" : countLine,
		"debugger" : countLine,
		"var"      : countLine,
		"const"    : countLine,
		"return"   : countLine,
		"throw"    : countLine,
		"try"      : countLine,
		"defun"    : countFunction,
		"if"       : countIf,
		"while"    : wrapBlock(2),
		"do"       : wrapBlock(2),
		"for"      : wrapBlock(4),
		"for-in"   : wrapBlock(4),
		"switch"   : countLine,
		"with"     : countLine,
		"function" : countFunction,
	}, function () {
		return walker.walk(tree);
	});

	var code = generateCode(instrumentedTree);
	return composeFile(file, lines, allConditions, allFunctions, code) + code;
};


/* These functions generate the final code, with the logic to send reports back to the server */
var composeFile = function (file, lines, allConditions, allFunctions, code) {
	var hl = highlight(code);
	return [
		// header comment saying that this file is instrumented
		header,
		// closure that creates the global objects
		"(", createGlobalObjects.toString(), ")('",
			// arguments for the closure call
			file, "',", JSON.stringify({
				lines : lines,
				code : hl,
				allConditions : allConditions,
				allFunctions : allFunctions
			}), ");(",
		//second closure with the logic to send the report to the server
		submitData.toString(), ")();"
	].join("");
};

var generateCode = function (tree) {
	return uglify.gen_code(tree, {beautify : true});
};

var createGlobalObjects = function (f, args) {
	var $$_l = this.$$_l;
	if (!this.$$_l) {
		$$_l = function (file, line) {
			$$_l.runLines[file][line] += 1;
		};
		$$_c = function (file, line, condition) {
			$$_l.conditions[file].push([line, !!condition]);
			return condition;
		};
		$$_f = function (file, name, line) {
			// to have a global view, fns are not divided by file here
			$$_l.runFunctions.push([file, name, line]);
		};
		$$_l.runLines = {};
		$$_l.lines = {};
		$$_l.code = {};
		$$_l.conditions = {};
		$$_l.allConditions = {};
		$$_l.allFunctions = {};
		$$_l.runFunctions = [];

		this.$$_l = $$_l;
	}
	$$_l.lines[f] = args.lines;
	$$_l.runLines[f] = {};
	for (var i = 0, len = args.lines.length; i < len; i += 1) {
		$$_l.runLines[f][args.lines[i]] = 0;
	}
	$$_l.code[f] = args.code;
	$$_l.conditions[f] = [];
	$$_l.allConditions[f] = args.allConditions;
	$$_l.allFunctions[f] = args.allFunctions;
};


// The serialize in this function is much simplified, values are string/object/array/boolean/Number
var submitData = function () {
	function serialize(object) {
		var properties = [];
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				properties.push('"' + key + '":' + getValue(object[key]));
			}
		}
		return "{" + properties.join(",") + "}";
	};
	function getValue(value) {
		if (typeof value === "string") {
			return quote(value);
		} else if (typeof value === "boolean") {
			return "" + value;
		} else if (value.join) {
			if (value.length == 0) {
				return "[]";
			} else {
				var flat = [];
				for (var i = 0, len = value.length; i < len; i += 1) {
					flat.push(getValue(value[i]));
				}
				return '[' + flat.join(",") + ']';
			}
		} else if (typeof value === "number") {
			return value;
		} else {
			return serialize(value);
		}
	};
	function pad(s) {
		return '0000'.substr(s.length) + s;
	};
	function replacer(c) {
		switch (c) {
			case '\b': return '\\b';
			case '\f': return '\\f';
			case '\n': return '\\n';
			case '\r': return '\\r';
			case '\t': return '\\t';
			case '"': return '\\"';
			case '\\': return '\\\\';
			default: return '\\u' + pad(c.charCodeAt(0).toString(16));
		}
	};
	function quote(s) {
		return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, replacer) + '"';
	};
	function send (data) {
		var xhr = (window.ActiveXObject) ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
		xhr.open('POST', '/node-coverage-store');
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(data);
	};

	if (!$$_l.submit) {
		$$_l.submit = function (name) {
			send(serialize({
				name : name || "",
				lines : $$_l.lines,
				runLines : $$_l.runLines,
				code : $$_l.code,
				allConditions : $$_l.allConditions,
				conditions : $$_l.conditions,
				allFunctions : $$_l.allFunctions,
				runFunctions : $$_l.runFunctions
			}));
		};
	}
};

exports.instrument = instrument;