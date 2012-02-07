// Looking for $$_l("filename", "lineId");
var regStatement = /\$\$_l\("[^"]+",\s?"([^"]+)"\);/g;
var regCondition = /\$\$_c\("[^"]+",\s?"([^"]+)",\s?/g;
var regFunction = /\$\$_f\("[^"]+",\s?"([^"]+)",\s?"([^"]+)"\);/g;

exports.highlight = function (code) {
	var mapped = [], nextCode;
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
				if (!mapped[mapped.length - 1][1]) {
					// This seems dangerous
					mapped[mapped.length - 1][1] = [];
				}
				mapped[mapped.length - 1][2] = fnMatch[1];
				// This is getting ugly, a line should be converted in json
			} else {
				// Code, not necessarly mapped to statement
				var tags = nextCode ? [nextCode] : [];
				while (condition = regCondition.exec(line)) {
					tags.push(condition[1]);
				}
				line = line.replace(regCondition, "("); // because we miss a closing bracket in regexp

				if (tags.length > 0) {
					mapped.push([line, tags]);
				} else {
					mapped.push([line]);
				}
				nextCode = null;
			}
		}
	});

	return mapped;
};