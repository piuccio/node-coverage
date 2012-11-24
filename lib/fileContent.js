var parser = require("uglify-js").parser;
var uglify = require("uglify-js").uglify;
var zlib = require("zlib");

/**
 * Get the original source code back from the code stored in a report
 * 
 * @param {Object} fileReport Report description for a given file
 * 
 * @return {String} original file content
 */
exports.getFullFile = function (fileReport) {
	var originalCode = "";
	var originalCodeStructure = fileReport.code.original;

	originalCodeStructure.forEach(function (line, index) {
		line.forEach(function (token) {
			if (typeof token === "string") {
				originalCode += token;
			}
		});

		if (index !== originalCodeStructure.length - 1) {
			originalCode += "\n";
		}
	}); 

	return originalCode;
}

/**
 * Get a modified version of the code including only covered statements
 * 
 * @param {Object} fileReport Report description for a given file
 * 
 * @return {String} file content
 */
exports.getCoveredFile = function (fileReport) {
	var originalCode = "";
	var originalCodeStructure = fileReport.code.original;

	var unusedStatement = null;
	originalCodeStructure.forEach(function (line, index) {
		line.forEach(function (token) {
			if (typeof token === "string") {
				if (!unusedStatement) {
					// we are not inside a non covered statement
					originalCode += token;
				}
			} else if (token.type === "sb") {
				var id = token.id;
				var covered = fileReport.statements.detail[id] > 0;

				if (!unusedStatement && !covered) {
					// Is it possible to have covered statements inside a non covered one?
					// I'd say no
					unusedStatement = id;
				}
			} else if (token.type === "se") {
				var id = token.id;

				if (unusedStatement && unusedStatement === id) {
					unusedStatement = null;
				}
			}
		});

		if (index !== originalCodeStructure.length - 1) {
			originalCode += "\n";
		}
	}); 

	return originalCode;
};

/**
 * Minify the code
 * 
 * @param {String} code Source code
 * 
 * @return {String} Minified code
 */
exports.minify = function (code) {
	var ast = parser.parse(code);
	ast = uglify.ast_mangle(ast);
	ast = uglify.ast_squeeze(ast);
	return uglify.gen_code(ast);
};

/**
 * Get the size of a minified and compressed file.
 * 
 * @param {String} code Source code
 * @param {Function} callback Function receiveing the size in bytes. NaN if error
 */
exports.getFullSize = function (fileReport, callback) {
	var code = exports.getFullFile(fileReport);
	exports.getSize(code, callback);
};

/**
 * Get the size of a minified and compressed file including only covered statements
 * 
 * @param {String} code Source code
 * @param {Function} callback Function receiveing the size in bytes. NaN if error
 */
exports.getCoveredSize = function (fileReport, callback) {
	var code = exports.getCoveredFile(fileReport);
	exports.getSize(code, callback);
};

/**
 * Get the minified and compressed size of certain code.
 * 
 * @param {String} code Source code
 * @param {Function} callback Function receiveing the size in bytes. NaN if error
 */
exports.getSize = function (code, callback) {
	var minify = exports.minify(code);

	gzip(minify, callback);
};

function gzip (code, callback) {
	zlib.gzip(code, function (err, buffer) {
		var size;
		if (err) {
			size = NaN;
		} else {
			size = buffer.length;
		}

		callback(size);
	});
}