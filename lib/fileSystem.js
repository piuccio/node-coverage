/**
 * This module performs any type of file system operation providing a more
 * abstract way of accessing files
 *
 * It exports the following methods
 *    perform -> perform a given action on a list of file
 *    writeFileTo -> write files in a destination folder
 */
var Q = require("q");
var glob = require("glob");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var file = require("./file");


/**
 * Perform a given action on a list of files.
 * The list of files is a glob pattern and the action is a node.js style
 * callback function.
 *
 * The callback has the signature
 * function (error, name, content)
 *    error Error raised reading the file or null if no error
 *    name File name, this is returned also in case of error
 *    content File content, null if error
 *
 * This method returns a promise that is fullfilled when all files have
 * been read
 *
 * @param {String} on Glob pattern
 * @param {Function} what Callaback function, called for every file matching the pattern
 * @param {Object} options [Optional] Object containing
 * <pre>
 *    exclude : list of paths to be excluded from the glob pattern. Every file
 *              starting with one of these patterns will be excluded
 *    verbose : log additional information, like the files we're working on
 * </pre>
 *
 * @return {Q.Promise}
 */
function perform (on, what, options) {
	var deferred = Q.defer();

	options = options || {};
	var globOptions = {
		mark : true
	};

	glob(on, globOptions, function (error, files) {
		if (options.verbose) {
			console.log("[fileSystem.perform] Performing an action on", files);
		}

		if (error) {
			deferred.reject(error);
		}

		// Remove any folder
		files = file.filterUnwanted(files, options.exclude || []);

		if (options.verbose) {
			console.log("[fileSystem.perform] Filtered list of files", files);
		}

		if (files.length === 0) {
			deferred.reject(new Error ("No file found"));
		} else {
			// This promised might fail for file system errors or exceptions
			// in the user defined callback
			readAll(files, what).then(function () {
				deferred.resolve();
			}, function (error) {
				deferred.reject(error);
			});
		}
	});

	return deferred.promise;
};

/**
 * Read all files matching the glob patterm, calling the callback
 * for each of them
 */
function readAll(files, callback) {
	// Reduce returns a promised that will be fullfilled when all files
	// have been read
	return files.reduce(function (working, file) {
		return working.then(getFSDeferred.bind(null, file, callback));
	}, Q.resolve(files));
};

/**
 * Get a deferred for a single file read
 */
function getFSDeferred (file, callback) {
	var deferred = Q.defer();
	fs.readFile(file, "utf-8", function (error, text) {
		try {
			if (error) {
				// I claim that I never get here becuase I already did a glob
				// but it might happen in race conditions...
				callback.call(null, error, file);
				deferred.reject(new Error(error));
			} else {
				callback.call(null, null, file, text);
				deferred.resolve(text);
			}
		} catch (ex) {
			deferred.reject(ex);
		}
	});
	return deferred.promise;
};

/**
 * Get a callback function able to write files in a folder replicating the
 * same structure they had in the source folder.
 *
 * The returned fuction has the signature
 *    function (file, code, encoding)
 * Where
 *    file is the target filename
 *    code is the file content
 *    encoding [Optional] file encoding
 *
 * For example
 *    src = /base/path
 *    dest = /destination
 *    file = /base/path/inner/folder/myFile.js
 * will create a file in
 *    /destination/inner/folder/myFile.js
 *
 * This function throws an error if destination folder exists already
 * and creates it otherwise with permission mask 0777
 *
 * @param {String} src Source folder
 * @param {String} dest Destination folder
 * @return {Function}
 */
function writeFileTo (src, dest) {
	var destinationRoot = path.resolve(dest);
	if (path.existsSync(destinationRoot)) {
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

function osIndependentFileName (fileName) {
	return fileName.split(path.sep).join("/");
}


exports.writeFileTo = writeFileTo;
exports.perform = perform;