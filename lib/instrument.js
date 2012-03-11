var clientCode = require("./clientCode");

function instrument (interpreters, file, content, options) {
	var specificify = 0, bestModule = null;
	interpreters.forEach(function (module) {
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

	if (bestModule) {
		return bestModule.interpret(file, content, options);
	} else {
		return clientCode.formatContent(content);
	}
};

function matchFile (filter, file) {
	if (!filter || !filter.files || !(filter.files instanceof RegExp)) {
		return false;
	}

	return filter.files.test(file);
};

function matchContent (filter, content) {
	if (!filter || !filter.content || !(filter.content instanceof RegExp)) {
		return false;
	}

	return filter.content.test(content);
};

module.exports = instrument;