var instrument = require("./instrument");
var clientCode = require("./clientCode");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");

var interpreters = [];
var subModules = fs.readdirSync(__dirname + "/interpreters");
subModules.forEach(function (moduleName) {
	var module = require("./interpreters/" + moduleName);

	if (!module.filter || !module.interpret) {
		console.error("Invalid module definition, " + moduleName);
	} else {
		interpreters.push(module);
	}
});

/* These functions are sync to avoid too many opened files */
function statFileOrFolder (fileOrFolder, basePath, callback, options, staticInfo) {
	var toBeExluded = options ? options.exclude : null;

	fileOrFolder.forEach(function (item) {
		var fileName = path.join(basePath, item);
		var stat = fs.statSync(fileName);

		if (!clientCode.shouldBeExcluded(osIndependentFileName(fileName), toBeExluded)) {
			if (stat.isFile()) {
				instrumentFile(item, basePath, callback, options, staticInfo);
			} else if (stat.isDirectory()) {
				instrumentFolder(item, basePath, callback, options, staticInfo);
			} else {
				console.error("Unable to instrument, neither a file nor a folder.", item, stats);
			}
		}
	});
}

function instrumentFile (file, basePath, callback, options, staticInfo) {
	var fileName = path.join(basePath, file);
	var osIndependentName = osIndependentFileName(fileName);
	
	var encoding = "utf-8";
	var content = fs.readFileSync(fileName, encoding);

	var instrumentationResult = instrument(osIndependentName, content, options);
	if (staticInfo && instrumentationResult.staticInfo) {
		staticInfo[osIndependentName] = instrumentationResult.staticInfo;
	}
	var instructed = instrumentationResult.clientCode;
	if (instructed === content) {
		instructed = fs.readFileSync(fileName);
		encoding = null;
	}

	if (callback) {
		callback.call(null, osIndependentName, instructed, encoding);
	}
}

function instrumentFolder (folder, basePath, callback, options, staticInfo) {
	var folderPath = path.join(basePath, folder);
	var files = fs.readdirSync(folderPath);

	statFileOrFolder(files, folderPath, callback, options, staticInfo);
}

function writeFileTo (src, dest) {
	var destinationRoot = path.resolve(dest);
	if (fs.existsSync(destinationRoot)) {
		throw new Error(destinationRoot + " exists already");
	}

	fs.mkdirSync(destinationRoot);

	return function (file, code, encoding) {
		var relative = path.relative(src, file);
		var fileName = path.resolve(destinationRoot, relative);
		var dirName = path.dirname(fileName);

		mkdirp.sync(dirName, 0777);

		fs.writeFileSync(fileName, code, encoding);
		fs.chmodSync(fileName, 0777);
	};
}

function getInterpreter (file, content, override) {
	var chooseFrom = override || interpreters;
	var specificify = 0, bestModule = null;
	
	chooseFrom.forEach(function (module) {
		var value = 0;

		if (matchFile(module.filter, file)) {
			value += 1;

			if (matchContent(module.filter, content)) {
				value += 2;
			}
		}

		if (value > specificify) {
			bestModule = module;
			specificify = value;
		} else if (value > 0 && value === specificify) {
			if (module.filter.files.toString().length > bestModule.filter.files.toString().length) {
				bestModule = module;
			}
		}
	});

	return bestModule;
}

function matchFile (filter, file) {
	if (!filter || !filter.files || !(filter.files instanceof RegExp)) {
		return false;
	}

	return filter.files.test(file);
}

function matchContent (filter, content) {
	if (!filter || !filter.content || !(filter.content instanceof RegExp)) {
		return false;
	}

	return filter.content.test(content);
}

function osIndependentFileName (fileName) {
	return fileName.split(path.sep).join("/");
}


exports.statFileOrFolder = statFileOrFolder;
exports.instrumentFile = instrumentFile;
exports.instrumentFolder = instrumentFolder;
exports.writeFileTo = writeFileTo;
exports.interpreters = interpreters;
exports.getInterpreter = getInterpreter;