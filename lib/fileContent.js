var parser = require("uglify-js").parser;
var uglify = require("uglify-js").uglify;
var zlib = require("zlib");

/**
 * Get the original source code back from the code stored in a report
 * 
 * @param {Object} fileReport Report description for a given file
 * 
 * @return {Object} original file content and its syntax tree
 */
exports.getFullFile = function (fileReport) {
	var code = fileReport.code;
	return {
		code: code,
		tree: parser.parse(code)
	};
}

/**
 * Get a modified version of the code including only covered statements
 * 
 * @param {Object} fileReport Report description for a given file
 * 
 * @return {Object} original file content and its syntax tree
 */
exports.getCoveredFile = function (fileReport) {
	var code = fileReport.code;
	var details = fileReport.statements.detail;
	var ast = parser.parse(code, false, true);

	function countLine () {
		try {
			var lineId = [
				this[0].name,
				this[0].start.line,
				this[0].start.pos,
				this[0].end.endpos
			].join("_");
			if (details[lineId] === 0) {
				return ["splice",[]];
			}
		} catch (ex) {}
	}

	function doNothing () {};

	function countFunction () {
		try {
			if (this[0].name === "defun") {
				return countLine.call(this);
			}
		} catch (ex) {}
	};

	function countIf () {
		try {
			var self = this;
			if (self[0].start) {
				var decision = self[1];

				// Make sure code blocks are actual blocks
				if (self[2] && self[2][0].start && self[2][0].start.value != "{") {
					self[2] = [ "block", [self[2]]];
				}

				if (self[3] && self[3][0].start && self[3][0].start.value != "{") {
					self[3] = [ "block", [self[3]]];
				}
			}
			return countLine.call(self);
		} catch (ex) {}
	}

	function wrapConditionals () {};

	var walker = uglify.ast_walker();
	var instrumentedTree = walker.with_walkers({
		"stat"     : countLine,
		"label"    : countLine,
		"break"    : countLine,
		"continue" : countLine,
		"debugger" : countLine,
		"var"      : countLine,
		"const"    : countLine,
		"return"   : countLine,
		"throw"    : countLine,
		"try"      : countLine,
		"defun"    : countFunction,
		"if"       : countIf,
		"while"    : countLine,
		"do"       : countLine,
		"for"      : countLine,
		"for-in"   : countLine,
		"switch"   : countLine,
		"with"     : countLine,
		"function" : countFunction,
		"assign"   : doNothing,
		"object"   : doNothing,
		"conditional": wrapConditionals
	}, function () {
		return walker.walk(ast);
	});

	return {
		code: uglify.gen_code(instrumentedTree, {beautify : false}),
		tree: instrumentedTree
	};
};

/**
 * Minify the code
 * 
 * @param {Object} ast Source code tree
 * 
 * @return {String} Minified code
 */
exports.minify = function (ast) {
	ast = uglify.ast_mangle(ast);
	ast = uglify.ast_squeeze(ast);
	return uglify.gen_code(ast);
};

/**
 * Get the size of a minified and compressed file.
 * 
 * @param {Object} fileReport Coverage report
 * @param {Function} callback Function receiveing the size in bytes. NaN if error
 */
exports.getFullSize = function (fileReport, callback) {
	var code = exports.getFullFile(fileReport);
	exports.getSize(code.tree, callback);
};

/**
 * Get the size of a minified and compressed file including only covered statements
 * 
 * @param {Object} fileReport Coverage report
 * @param {Function} callback Function receiveing the size in bytes. NaN if error
 */
exports.getCoveredSize = function (fileReport, callback) {
	var code = exports.getCoveredFile(fileReport);
	exports.getSize(code.tree, callback);
};

/**
 * Get the minified and compressed size of certain code.
 * 
 * @param {Object} tree Source code tree
 * @param {Function} callback Function receiving the size in bytes. NaN if error
 */
exports.getSize = function (tree, callback) {
	try {
		var minify = exports.minify(tree);

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
