// Looking for $$_l("filename", "lineId");
var regStatement = /\$\$_l\("[^"]+",\s?"([^"]+)"\);/g;
var regCondition = /\$\$_c\("[^"]+",\s?"([^"]+)",\s?/g;
var regFunction = /\$\$_f\("[^"]+",\s?"([^"]+)"\);/g;

/**
 * This function returns a cleaned representation of the generated code.
 * The return value is an object containing
 *   
 *   src : array (one entry per line of code) where value are object with
 *        s : source line
 *        l : lineid of the instrumented function
 *        c : list of conditions (array)
 *   fns : object mapping a function id to the generated line of code
 */
exports.highlight = function (code) {
	var mapped = [], nextCode;
	var result = {
		src : [],
		fns : {}
	};
	var split = code.split("\n");
	split.forEach(function (line) {
		var match = regStatement.exec(line);
		if (match) {
			// This line has $$_l it's not code, remember for later
			nextCode = match[1];
		} else {
			var fnMatch = regFunction.exec(line);
			if (fnMatch) {
				// The previous line was a function
				result.fns[fnMatch[1]] = mapped.length - 1;
			} else {
				// Code, not necessarly mapped to statement
				var tags = [], generatedLine = {};

				if (nextCode) {
					generatedLine.l = nextCode;
				}

				while (condition = regCondition.exec(line)) {
					tags.push(condition[1]);
				}
				line = line.replace(regCondition, "("); // because we miss a closing bracket in regexp
				if (tags.length > 0) {
					generatedLine.c = tags;
				}

				generatedLine.s = line;

				mapped.push(generatedLine);
				nextCode = null;
			}
		}
	});

	result.src = mapped;

	return result;
};