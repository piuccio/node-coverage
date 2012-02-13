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
	}).describe("p", "Web server port")
	.options("a", {
		"alias" : "admin-port",
		"default" : 8787
	}).describe("a", "Admin server port")
	.boolean("h").alias("h", "help")
	.boolean("function")
		.default("function", false)
		.describe("function", "Enable function coverage. Disable with --no-function")
	.boolean("condition")
		.default("condition", true)
		.describe("condition", "Enable condition coverage. Disable with --no-condition")
	.boolean("session")
		.default("session", true)
		.describe("session", "Store instrumented code in session storage. This reduces the burden on browsers. Disable with --no-session")
	.argv;


if (argv.h) {
	return require("optimist").showHelp();
}


try {
	var stat = fs.statSync(argv.r);
	if (!stat.isDirectory()) {
		throw new Error(argv.r + " is not a directory");
	}

	/* Instrumentation server */
	require("./lib/server/instrumentation").start(argv.d, argv.p, argv.r, argv.a, {
		"function" : argv["function"],
		"condition" : argv.condition,
		"doHighlight" : !argv.session
	});

	/* Admin server */
	require("./lib/server/administration").start(argv.d, argv.p, argv.r, argv.a);
} catch (ex) {
	console.error("Please specify a valid report directory", ex);
}