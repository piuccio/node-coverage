#!/usr/bin/env node
var fs = require("fs");
var report = require("./lib/report");
var mkdirp = require("mkdirp");
var path = require("path");
var argv = require("optimist")
	.usage("Merge coverage reports.\n$0 -o destination source [source ...]")
	.boolean("h").alias("h", "help")
	.alias("o", "output").describe("o", "Output file.")
	.argv;


if (argv.h) {
	help(true);
} else if (!argv.o) {
	console.error("Output file is mandatory.");
	help();
} else if (argv._.length < 2) {
	console.error("Merge requires at least two files.");
	help();
} else {
	good(argv.o, argv._);
}

function help (cleanExit) {
	require("optimist").showHelp();
	if (!cleanExit) {
		process.exit(1);
	}
}

function good (destination, files) {
	var reports = [];
	files.forEach(function (file) {
		reports.push(JSON.parse(fs.readFileSync(file)));
	});
	mkdirp.sync(path.dirname(destination));
	fs.writeFileSync(destination, JSON.stringify(report.mergeReports(reports)));
}
