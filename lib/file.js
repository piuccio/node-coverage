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
 * Convert a name into an OS independent file name. In windows names have a backward slash
 * that in JavaScript strings can be interpreted as an escaping sequence. This method
 * converts such names into forward slashes
 *
 * @param {String} name File name
 */
exports.osIndependent = function (name) {
	return name.split(path.sep).join("/");
};