/**
 * Disk storage
 * This implementation reads and save content file into disk.
 * The content name is the full absolute path on the disk
 */
var fs = require("fs");
var mkdirp = require("mkdirp");
var path = require("path");
var glob = require("glob");
var Q = require("q");
var fileUtil = require("../file");

exports.save = function (name, content, callback) {
	var osIndependent = fileUtil.osIndependent(name);
	fs.stat(osIndependent, function (err, stats) {
		if (err) {
			// File doesn't exists, I can try to create it
			mkdirp.sync(path.dirname(osIndependent), 0777);
		} else if (!stats.isFile()) {
			// Not a file, maybe a directory or a device, I'm afraid to go on
			return callback(osIndependent + " exists and is not a file");
		} else {
			// Normal file, it should be fine to open it
		}

		// Nobody returned, and the dirname is available
		fs.writeFile(osIndependent, content, "utf-8", callback);
	});
};

exports.read = function (name, callback) {
	if (typeof name === "string") {
		var osIndependent = fileUtil.osIndependent(name);
		fs.readFile(osIndependent, "utf-8", function (err, content) {
			var myError = err ? new Error(osIndependent + " not found") : null;
			callback(myError, content);
		});
	} else {
		var result = {};

		name.reduce(function (working, file) {
			return working.then(getFile.bind(null, fileUtil.osIndependent(file), result));
		}, Q.resolve(name)).then(function () {
			callback(null, result);
		}, function (error) {
			// Error file name is made independent before rejecting the deferred
			callback(error);
		});
	}
};

exports.keys = function (base, callback) {
	var globOptions = {
		mark : true
	};
	glob(base + "/*", globOptions, function (error, keys) {
		// glob gives already os independent file names
		if (error) {
			callback(error);
		} else {
			var filtered = keys.filter(function (key) {
				return key.charAt(key.length - 1) !== "/";
			});

			callback(null, filtered);
		}
	});
};

function getFile (file, result) {
	var deferred = Q.defer();
	fs.readFile(file, "utf-8", function (error, text) {
		if (error) {
			deferred.reject(new Error(fileUtil.osIndependent(error.path + " not found")));
		} else {
			result[file] = text;
			deferred.resolve(text);
		}
	});
	return deferred.promise;
};