var clientCode = require("./clientCode");
var interpreters = require("./interpreters");

function instrument (file, content, options) {
	var interpreter = interpreters.getInterpreter(file, content);

	if (interpreter) {
		return interpreter.interpret(file, content, options);
	} else {
		return clientCode.formatContent(content);
	}
}

module.exports = instrument;