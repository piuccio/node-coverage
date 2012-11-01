/**
 * This module loads all interpreters available in the interpeters folder
 * and has methods to understand which is the most appropriate interpreters
 * depending on file name or content.
 *
 * It exports the methods
 *    getInterpreter -> returns the best interpreter for a file
 *
 * More on https://github.com/piuccio/node-coverage/tree/master/doc/INTERPRETERS.md
 */
var fs = require("fs");

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

/**
 * Get the best interpreter for a given file
 *
 * By default it iterates over interpreters available in interpreters folder,
 * but for unit testing it's possible to specify the list of interpreters
 * to be used
 *
 * @param {String} file File name
 * @param {String} content File content
 * @param {Array} override [Optional] List of interpreters module instances
 */
function getInterpreter (file, content, override) {
	var chooseFrom = override || interpreters;
	var specificify = 0, bestModule = null;
	
	chooseFrom.forEach(function (module) {
		var value = 0;

		if (matchFile(module.filter, file)) {
			value += 1;

			if (content && matchContent(module.filter, content)) {
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

exports.getInterpreter = getInterpreter;