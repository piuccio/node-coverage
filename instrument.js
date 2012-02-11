var fileSystem = require("./lib/fileSystem");
var argv = require("optimist")
	.usage("Instrument a folder for code coverage.\n$0 source destination")
	.boolean("h").alias("h", "help")
	.boolean("t").alias("t", "test").describe("t", "Run unit tests.")
	.boolean("function")
		.default("function", false)
		.describe("function", "Enable function coverage. Disable with --no-function")
	.boolean("condition")
		.default("condition", true)
		.describe("condition", "Enable condition coverage. Disable with --no-condition")
	.argv;



if (argv.t) {
	runTests();
} else if (argv._.length == 2) {
	instrumentFolder();
} else {
	displayHelp();
}


function runTests () {
	require("nodeunit").reporters.default.run(['test']);
};

function displayHelp () {
	require("optimist").showHelp();
};

function instrumentFolder () {
	var src, callback;

	src = [argv._[0]];
	try {
		callback = fileSystem.writeFileTo(src[0], argv._[1]);
	} catch (ex) {
		require("optimist").showHelp();
		return console.error(ex);
	}

	fileSystem.statFileOrFolder(src, "", callback, {
		"function" : argv["function"],
		"condition" : argv.condition
	});
};