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
	var object, error;

	if (typeof name === "string") {
		object = storage[name];

		error = object ? null : new Error("Couldn't find object '" + name + "' in memory");
	} else {
		object = {};
		name.forEach(function (single) {
			if (storage[single]) {
				object[single] = storage[single];
			} else {
				error = new Error("Couldn't find object '" + single + "' in memory");
			}
		});
	}

	callback(error, error ? null : object);
};

exports.keys = function (base, callback) {
	var filtered = Object.keys(storage).filter(function (key) {
		return key.indexOf(base) === 0;
	});

	callback(null, filtered);
};