module.exports = [
	{
		s : "var done = true;",
		line : 0,
		sid : 1,
		cid : 0,
		fid : 0,
		node : ["sb", "t", "se"]
	},
	{
		s : "/**",
		line : 1,
		sid : 0,
		cid : 0,
		fid : 0,
		node : ["t"]
	},
	{
		s : " * Logger constructor",
		line : 2,
		sid : 0,
		cid : 0,
		fid : 0,
		node : ["t"]
	},
	{
		s : " */",
		line : 3,
		sid : 0,
		cid : 0,
		fid : 0,
		node : ["t"]
	},
	{
		s : "var Logger = function () {",
		line : 4,
		sid : 1,
		cid : 0,
		fid : 1,
		node : ["sb", "t", "fb", "t"]
	},
	{
		s : "	var scope = [];",
		line : 5,
		sid : 1,
		cid : 0,
		fid : 0,
		node : ["t", "sb", "t", "se"]
	},
	{
		s : "	return {",
		line : 6,
		sid : 1,
		cid : 0,
		fid : 0,
		node : ["t", "sb", "t"]
	},
	{
		s : "		log : function (t) {",
		line : 7,
		sid : 0,
		cid : 0,
		fid : 1,
		node : ["t", "fb", "t"]
	},
	{
		s : "			scope.push(t);",
		line : 8,
		line : 0,
		sid : 1,
		cid : 0,
		fid : 0,
		node : ["t", "sb", "t", "se"]
	},
	{
		s : "		},",
		line : 9,
		sid : 0,
		cid : 0,
		fid : 0,
		node : ["t", "fe", "t"]
	},
	{
		s : "		all : function () {",
		line : 10,
		sid : 0,
		cid : 0,
		fid : 1,
		node : ["t", "fb", "t"]
	},
	{
		s : "			return scope.join(\"\\n\");",
		line : 11,
		sid : 1,
		cid : 0,
		fid : 0,
		node : ["t", "sb", "t", "se"]
	},
	{
		s : "		}",
		line : 12,
		sid : 0,
		cid : 0,
		fid : 0,
		node : ["t", "fe"]
	},
	{
		s : "	};",
		line : 13,
		sid : 0,
		cid : 0,
		fid : 0,
		node : ["t", "se"]
	},
	{
		s : "};",
		line : 14,
		sid : 0,
		cid : 0,
		fid : 0,
		node : ["t", "fe", "t", "se"]
	},
	{
		s : "// logger instance",
		line : 15,
		sid : 0,
		cid : 0,
		fid : 0,
		node : ["t"]
	},
	{
		s : "var log = new Logger();",
		line : 16,
		sid : 1,
		cid : 0,
		fid : 0,
		node : ["sb", "t", "se"]
	},
	{
		s : "if (done && !false) {",
		line : 17,
		sid : 1,
		cid : 1,
		fid : 0,
		node : ["sb", "t", "cb", "t", "ce", "t", "cb", "t", "ce", "t"]
	},
	{
		s : "	log.log(\"condition true\");",
		line : 18,
		sid : 1,
		cid : 0,
		fid : 0,
		node : ["t", "sb", "t", "se"]
	},
	{
		s : "} else {",
		line : 19,
		sid : 0,
		cid : 0,
		fid : 0,
		node : ["t"]
	},
	{
		s : "	log.log(\"condition false\");",
		line : 20,
		sid : 1,
		cid : 0,
		fid : 0,
		node : ["t", "sb", "t", "se"]
	},
	{
		s : "}",
		line : 21,
		sid : 0,
		cid : 0,
		fid : 0,
		node : ["t", "se"]
	}
];