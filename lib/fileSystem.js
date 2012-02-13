var instrument = require("./instrument").instrument;
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");

/* These functions are sync to avoid too many opened files */
function statFileOrFolder (fileOrFolder, basePath, callback, options) {
	fileOrFolder.forEach(function (item) {
		var fileName = path.join(basePath, item);
		var stat = fs.statSync(fileName);

		if (stat.isFile()) {
			instrumentFile(item, basePath, callback, options);
		} else if (stat.isDirectory()) {
			instrumentFolder(item, basePath, callback, options);
		} else {
			console.error("Unable to instrument, niether a file nor a folder.", item, stats);
		}
	});
};

function instrumentFile (file, basePath, callback, options) {
	var fileName = path.join(basePath, file);
	var isJS = (path.extname(fileName) === ".js");
	var content = fs.readFileSync(fileName, isJS ? "utf-8" : null);

	var code = isJS ? instrument(fileName, content, options).clientCode : content;

	if (callback) {
		callback.call(null, fileName, code);
	}
};

function instrumentFolder (folder, basePath, callback, options) {
	var folderPath = path.join(basePath, folder);
	var files = fs.readdirSync(folderPath);

	statFileOrFolder(files, folderPath, callback, options);
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


exports.statFileOrFolder = statFileOrFolder;
exports.instrumentFile = instrumentFile;
exports.instrumentFolder = instrumentFolder;
exports.writeFileTo = writeFileTo;