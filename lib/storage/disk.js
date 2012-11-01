/**
 * Disk storage
 * This implementation reads and save content file into disk.
 * The content name is the full absolute path on the disk
 */
var fs = require("fs");
var mkdirp = require("mkdirp");
var path = require("path");

exports.save = function (name, content, callback) {
	fs.stat(name, function (err, stats) {
		if (err) {
			// File doesn't exists, I can try to create it
			mkdirp.sync(path.dirname(name), 0777);
		} else if (!stats.isFile()) {
			// Not a file, maybe a directory or a device, I'm afraid to go on
			return callback(name + " exists and is not a file");
		} else {
			// Normal file, it should be fine to open it
		}

		// Nobody returned, and the dirname is available
		fs.writeFile(name, content, "utf-8", callback);
	});
};

exports.read = function (name, callback) {
	fs.readFile(name, "utf-8", callback);
};