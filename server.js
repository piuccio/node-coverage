var fs = require("fs");
var argv = require("optimist")
	.usage("Start a simple web server to instrument JS code.")
	.options("d", {
		"alias" : "doc-root",
		"default" : "/var/www"
	}).describe("d", "Document Root. Content from this path will be served by the server")
	.options("r", {
		"alias" : "report-dir",
		"default" : "/var/log/node-coverage"
	}).describe("r", "Directory where reports are stored.")
	.options("p", {
		"alias" : "port",
		"default" : 8080
	}).describe("Web server port")
	.options("a", {
		"alias" : "admin-port",
		"default" : 8787
	}).describe("Admin server port")
	.boolean("h").alias("h", "help")
	.argv;

if (argv.h) {
	require("optimist").showHelp();
}

try {
	var stat = fs.statSync(argv.r);
	if (!stat.isDirectory()) {
		throw new Error(argv.r + " is not a directory");
	}

	/* Instrumentation server */
	require("./lib/server/instrumentation").start(argv.d, argv.p, argv.r, argv.a);

	/* Admin server */
	require("./lib/server/administration").start(argv.d, argv.p, argv.r, argv.a);
} catch (ex) {
	console.error("Please specify a valid report directory", ex);
}