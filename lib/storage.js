module.exports = function (options) {
	// Available modules
	var available = ["memory", "disk"], module;

	if (options && options.storage) {
		if (available.indexOf(options.storage) !== -1 || isAModule(options.storage)) {
			module = options.storage;
		}
	}

	if (typeof module === "string") {
		module = require("./storage/" + module);
	}
	
	if (!isAModule(module)) {
		throw new TypeError("Unable to find a storage module");
	}

	return module;
};

function isAModule(module) {
	if (!module) {
		return false;
	} else if (!module.read || typeof module.read !== "function") {
		return false;
	} else if (!module.save || typeof module.save !== "function") {
		return false;
	}
	
	return true;
}