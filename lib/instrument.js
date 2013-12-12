/**
 * This module handles the file content to produce a JSON object containing
 * instrumented code and possible errors
 *
 * The module itself is a function
 */
var clientCode = require("./clientCode");
var interpreters = require("./interpreters");

/**
 * Instrument a given file if it's not already instrumented and there's
 * at least one available interpreter for that file and content
 *
 * @param {String} file File name
 * @param {String} content File content
 * @param {Object} options [Optional] configuration options passed to the interpreter
 *
 * @return {Object} Result of 'formatContent' function from module 'clientCode'
 */
module.exports = function (file, content, options) {
	var error = false, asIs = false, verbose = options && options.verbose;
	var instrumented = content;

	if (clientCode.isInstrumented(content)) {
		if (verbose) {
			console.log("\t", file, "already instrumented");
		}

		// The file is already instrumented, no need to mark it
		asIs = true;

	} else if (options && clientCode.shouldBeExcluded(file, options.ignore)) {
		if (verbose) {
			console.log("\t", file, "ignored");
		}

		// The file should be ignored, so just mark it (default)
	} else {

		var interpreter = interpreters.getInterpreter(file, content);

		var instrumented, error = false;
		if (interpreter) {
			try {
				var structure = interpreter.interpret(file, content, options);
				instrumented = clientCode.generate(file, content, options, structure);
			} catch (ex) {
				// The interpreter fails, let's not deal with it
				console.error("Error instrumentig file", file, verbose ? ex : ex.message);
				instrumented = content;
				error = true;
				asIs = true;
			}
		} else {
			// We don't have any interpreter, better not touch the file
			asIs = true;
		}
	}

	return clientCode.format(instrumented, error, asIs);
};