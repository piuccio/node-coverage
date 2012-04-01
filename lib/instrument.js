var clientCode = require("./clientCode");

function instrument (file, content, options) {
	var interpreter = require("./fileSystem").getInterpreter(file, content);

	if (interpreter) {
		return interpreter.interpret(file, content, options);
	} else {
		return clientCode.formatContent(content);
	}
}

module.exports = instrument;