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
	var openCondition = null;
	originalCodeStructure.forEach(function (line, index) {
		line.forEach(function (token, tokenIndex) {
			if (typeof token === "string") {
				if (!unusedStatement) {
					// we are not inside a non covered statement
					originalCode += token;
				}
			} else if (token.type === "sb") {
				if (unusedStatement) {
					// I'm already in a non-covered statement, go on
					return;
				}

				var id = token.id;
				var covered = fileReport.statements.detail[id] > 0;

				if (openCondition) {
					openCondition = null;
					if (!covered) {
						// There's an open condition that is not covered.
						// I know it because this statement is not covered
						if (!originalCode.match(/\{\s*$/)) {
							// We never opened the condition block
							originalCode += "{}";
							openCondition = null;
						}
					}
				}

				if (id.indexOf("if") === 0 || id.indexOf("for") === 0 || id.indexOf("while") === 0) {
					// condition are special as they might end up with no body
					openCondition = id;
				}

				if (!covered) {
					// Is it possible to have covered statements inside a non covered one?
					// I'd say no
					unusedStatement = id;
					if (id.indexOf("if") === 0 && originalCode.match(/else\s*$/)) {
						// else if are converted into if statements
						// but else remains without braces
						originalCode += "{}";
						// if the else if was not executed I claim we'll never get to
						// the else either
					}
				}
			} else if (token.type === "se") {
				var id = token.id;

				if (unusedStatement === id) {
					unusedStatement = null;
				}
				if (id.indexOf("if") === 0 && originalCode.match(/else\s*$/)) {
					// This is an else statement (not an else if)
					// If the else is not covered we end up with empty body, no brackets
					originalCode += "{}";
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
	try {
		var minify = exports.minify(code);

		gzip(minify, callback);
	} catch (ex) {
		callback(NaN);
	}
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