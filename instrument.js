#!/usr/bin/env node
var fileSystem = require("./lib/fileSystem");
var fs = require("fs");
var argv = require("optimist")
	.usage("Instrument a folder for code coverage.\n$0 source destination")
	.boolean("h").alias("h", "help")
	.boolean("function")
		.default("function", false)
		.describe("function", "Enable function coverage. Disable with --no-function")
	.boolean("condition")
		.default("condition", true)
		.describe("condition", "Enable condition coverage. Disable with --no-condition")
	.boolean("submit")
		.default("submit", true)
		.describe("submit", "Include submit code in instrumented file. Disable with --no-submit")
	.options("s", {
		"alias" : "static-info"
	}).describe("s", "Path to a JSON output file which will contain static information about instrumented files. Using this option reduces the size of instrumented files.")
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
		instrumentFile(argv._[0], argv);
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
		var staticInfoFile = options["static-info"];
		var staticInfo = staticInfoFile ? {} : null;

		fileSystem.statFileOrFolder([source], "", callback, {
			"function" : options["function"],
			"condition" : options["condition"],
			"submit" : options["submit"],
			"staticInfo": !staticInfo,
			"exclude" : options.exclude,
			"ignore" : options.ignore,
			"verbose" : options.verbose
		}, staticInfo);

		if (staticInfo) {
			fs.writeFileSync(staticInfoFile, JSON.stringify(staticInfo));
		}
	} catch (ex) {
		require("optimist").showHelp();
		return console.error(ex);
	}
};

function instrumentFile (fileName, options) {
	var callback = function (file, code) {
		console.log(code);
	};

	fileSystem.statFileOrFolder([fileName], "", callback, {
		"function" : options["function"],
		"condition" : options["condition"],
		"submit" : options["submit"],
		"staticInfo": !options["static-info"],
		"exclude" : options.exclude,
		"ignore" : options.ignore,
		"verbose" : options.verbose
	});
};