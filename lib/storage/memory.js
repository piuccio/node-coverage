/**
 * Memory storage.
 * This is a very simple implementation of a in-memory storage.
 * Content is simply saved inside a private storage object working as a hash map
 */
var storage = {};

exports.save = function (name, content, callback) {
	storage[name] = content;

	callback(null);
};

exports.read = function (name, callback) {
	var object = storage[name];

	var error = object ? null : new Error("Couldn't find object '" + name + "' in memory");
	callback(error, object);
};

exports.keys = function (base, callback) {
	var filtered = Object.keys(storage).filter(function (key) {
		return key.indexOf(base) === 0;
	});

	callback(null, filtered);
};