var fileSystem = require("./lib/fileSystem");
var instrument = require("./lib/instrument");
var argv = require("optimist")
	.usage("Instrument a folder for code coverage.\n$0 source destination")
	.boolean("h").alias("h", "help")
	.boolean("function")
		.default("function", false)
		.describe("function", "Enable function coverage. Disable with --no-function")
	.boolean("condition")
		.default("condition", true)
		.describe("condition", "Enable condition coverage. Disable with --no-condition")
	.options("x", {
		"alias" : "exclude"
	}).describe("x", "Exclude file or folder. This file/folder won't be copied in target folder. Path relative to the source folder")
	.options("i", {
		"alias" : "ignore"
	}).describe("i", "Ignore file or folder. This file/folder is copied in target folder but not instrumented. Path relative to the source folder")
	.boolean("v").alias("v", "verbose").default("v", false)
	.argv;



switch (argv._.length) {
	case 1:
		instrumentPattern(argv._[0], argv);
		break;
	case 2:
		instrumentFolder(argv._[0], argv._[1], argv);
		break;
	default:
		displayHelp();
		break;
}

function displayHelp () {
	require("optimist").showHelp();
};

function instrumentFolder (source, destination, options) {
	try {
		var callback = fileSystem.writeFileTo(source, destination);

		fileSystem.statFileOrFolder([source], "", callback, {
			"function" : options["function"],
			"condition" : options["condition"],
			"doHighlight" : true,
			"exclude" : options.exclude,
			"ignore" : options.ignore,
			"verbose" : options.verbose
		});
	} catch (ex) {
		require("optimist").showHelp();
		return console.error(ex);
	}
};

function instrumentPattern (pattern, cmdLineOptions) {
	var options = {
		"function" : cmdLineOptions["function"],
		"condition" : cmdLineOptions["condition"],
		"doHighlight" : true,
		"verbose" : cmdLineOptions.verbose
	};

	var onFileRead = function (error, file, code) {
		if (error) {
			console.error(file, error);
		} else {
			var result = instrument(file, code, options);

			console.log("//", file);
			if (options.verbose) {
				console.log(result);
			} else {
				console.log(result.clientCode);
			}
		}
	};

	var exitWithError = function () {

	}

	fileSystem.perform(pattern, onFileRead, options).then(null, function (error) {
		console.error(error);
		nextThick(function () {
			process.exit(1);
		});
	});
};
