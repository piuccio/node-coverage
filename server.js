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
	.options("i", {
		"alias" : "ignore"
	}).describe("i", "Ignore file or folder. This file/folder won't be instrumented. Path relative to document root")
	.boolean("proxy")
		.default("proxy", false)
		.describe("proxy", "Start the instrumentation server in HTTP proxy mode on port specified by -p.")
	.argv;


if (argv.h) {
	require("optimist").showHelp();
} else {
	try {
		var stat = fs.statSync(argv.r);
		if (!stat.isDirectory()) {
			throw new Error(argv.r + " is not a directory");
		}
		
		var ignore = argv.i || [];
		if (!ignore.forEach) {
			ignore = [ignore];
		}

		/* Instrumentation server */
		if (argv.proxy) {
			require("./lib/server/proxy").start(argv.d, argv.p, argv.r, argv.a, {
				"function" : argv["function"],
				"condition" : argv.condition,
				"doHighlight" : true
			});
		} else {
			require("./lib/server/instrumentation").start(argv.d, argv.p, argv.r, argv.a, {
				"function" : argv["function"],
				"condition" : argv.condition,
				"doHighlight" : !argv.session,
				"ignore" : ignore.map(function (path) {
					if (path.charAt(0) !== "/") {
						return "/" + path;
					} else {
						return path;
					}
				})
			});
		}

		/* Admin server */
		require("./lib/server/administration").start(argv.d, argv.p, argv.r, argv.a);
	} catch (ex) {
		console.error("Please specify a valid report directory", ex);
	}
}