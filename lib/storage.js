/**
 * Creates an instance of storage.
 * Throws an exception is no storage is available
 *
 * @param {Object} options configuration object. Must contain "storage" 
 * that can be either one from "disk", "memory" or a module
 *
 * @return Storage module of choise
 */
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

/**
 * Determines whether an object is a storage module or not.
 *
 * A module should have the methods
 *    read  -> get some content from the storage
 *    save  -> store something
 *
 * @param {Object} module Module instance
 */
function isAModule(module) {
	if (!module) {
		return false;
	} else if (!module.read || typeof module.read !== "function") {
		return false;
	} else if (!module.save || typeof module.save !== "function") {
		return false;
	} else if (!module.keys || typeof module.keys !== "function") {
		return false;
	}
	
	return true;
}