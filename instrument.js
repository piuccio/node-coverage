var instrument = require("./lib/instrument");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var argv = require("optimist")
	.usage("Instrument a file or folder for code coverage.\n$0 source destination")
	.boolean("t").alias("t", "test").describe("t", "Run unit tests.")
	.argv;

var src, dest, callback;
if (argv.t) {
	// run all tests comparing with the expected value
	src = ["test/code/"];
	callback = require("./test/expected.js").compare;
} else if (argv._.length == 2) {
	// statFileOrFolder wants an array
	src = [argv._[0]];
	var destinationRoot;
	try {
		callback = writeFileTo(src[0], argv._[1]);
	} catch (ex) {
		require("optimist").showHelp();
		return console.error(ex);
	}
} else {
	return require("optimist").showHelp();
}

statFileOrFolder(src, "", callback);


/* These functions are sync to avoid too many opened files */
function statFileOrFolder (files, basePath, callback) {
	files.forEach(function (item) {
		var fileName = path.join(basePath, item);
		var stat = fs.statSync(fileName);

		if (stat.isFile()) {
			instrumentFile(item, basePath, callback);
		} else if (stat.isDirectory()) {
			instrumentFolder(item, basePath, callback);
		} else {
			console.error("Unable to instrument, niether a file nor a folder.", item, stats);
		}
	});
};

function instrumentFile (file, basePath, callback) {
	var fileName = path.join(basePath, file);
	var isJS = (path.extname(fileName) === ".js");
	var content = fs.readFileSync(fileName, isJS ? "utf-8" : null);

	var code = isJS ? instrument.instrument(fileName, content) : content;

	if (callback) {
		callback.call(null, fileName, code);
	}
};

function instrumentFolder (folder, basePath, callback) {
	var folderPath = path.join(basePath, folder);
	var files = fs.readdirSync(folderPath);

	statFileOrFolder(files, folderPath, callback);
};

function writeFileTo (src, dest) {
	var destinationRoot = path.resolve(dest);
	if (path.existsSync(destinationRoot)) {
		throw new Error(destinationRoot + " exists already");
	}

	fs.mkdirSync(destinationRoot);

	return function (file, code) {
		var relative = path.relative(src, file);
		var fileName = path.resolve(destinationRoot, relative);
		var dirName = path.dirname(fileName);
		var isJS = (path.extname(fileName) === ".js");

		mkdirp.sync(dirName);

		fs.writeFileSync(fileName, code, isJS ? "utf-8" : null);
	};
};