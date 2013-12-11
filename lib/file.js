/**
 * This module has generic utilities to handle files, their name and their content
 *
 * It exports
 *    filterUnwanted -> From an array of paths return only non excluded files
 *    wanted -> Wheter a file is wanted or not according to a filtering array
 *    isInstrumented -> Whether or not the code is already instrumented
 *    markInstrumented -> Mark the code as already instrumented
 *    createReportName -> Create a name for a report
 *    extractName -> Extract a clean file name from a report name
 *    extractTime -> Extract time information from a report name
 */
var path = require("path");

/**
 * Return an array containing only non excluded files.
 * Every file starting with one of the patterns in exclude will be excluded
 * It relies on the assumption that folder names end with '/'
 *
 * @param {Array} files Original list of paths (files and folders)
 * @param {Array|String} exclude List of starting paths to be excluded
 */
exports.filterUnwanted = function (files, exclude) {
	return files.filter(function (name) {
		// No folders
		if (name.charAt(name.length - 1) === "/") {
			return false;
		}
		if (typeof exclude === "string") {
			exclude = [exclude];
		}

		return wanted(name, exclude);
	});
};

/**
 * Whether a single file should be excluded or not.
 *
 * @param {String} file File to be checked
 * @param {Array} exclude List of starting paths to be excluded
 */
exports.wanted = wanted = function (file, exclude) {
	for (var i = 0, len = exclude.length; i < len; i += 1) {
		if (file.indexOf(exclude[i]) === 0) {
			return false;
		}
	}
	return true;
};


/**
 * Convert a name into an OS independent file name. In windows names have a backward slash
 * that in JavaScript strings can be interpreted as an escaping sequence. This method
 * converts such names into forward slashes
 *
 * @param {String} name File name
 */
exports.osIndependent = function (name) {
	return name.split(path.sep).join("/");
};