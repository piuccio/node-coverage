var fileUtil = require("./file");

/**
 * Split the code into line.
 * Every line is described as nodes of type
 *   [string] Text token
 *   [Object] Containing
 *       id : Id of the node (statement, condition, function)
 *       type : Two letter code, e.g. 'sb' where
 *                 [1] is either 's', 'c' or 'f'
 *                 [2] is either 'b' or 'e', respectively begin, end
 *       position : Charatcer number where the node is located
 *   
 * Ids have the syntax [name]_[line]_[begin]_[end]
 *
 * @param {String} code Source code, non instrumented
 * @param {Object} tree The result of interpret, contains
 *    lines : {Array} list of statements id
 *    conditions : {Array} list of conditions id
 *    functions : {Array} list of functions id
 *
 * @return {Array} list of line, each of them is again an array containing
 *    the list of nodes
 */
module.exports = function (code, tree) {
	// As far as I understood, that's how Uglify handles new lines
	code = fileUtil.normalizeNewLines(code);

	var spots = sortSpots(tree);
	var lines = [[]];

	// Current working spot
	var spot = spots.splice(0, 1)[0];
	// Next char position for this spot
	var nextSpot = spot.position;
	// Next new line position
	var nextNewLine = code.indexOf("\n");
	if (nextNewLine === -1) {
		// The whole file is on one line
		nextNewLine = code.length;
	}
	// Last consumed character
	var lastUsed = 0;
	// Current line
	var currentLine = 0;

	do {
		if (nextNewLine >= nextSpot) {
			// Spot comes first, remember the chunk of text before the stop
			if (nextSpot > lastUsed) {
				lines[currentLine].push(code.substring(lastUsed, nextSpot));
			}
			lines[currentLine].push(spot);
			// Increment pointers
			lastUsed = nextSpot;
			spot = spots.splice(0, 1)[0];
			if (spot) {
				nextSpot = spot.position;
			} else {
				// Let new line be processed
				nextSpot = Infinity;
				if (nextNewLine === Infinity) {
					break;
				}
			}
		} else {
			// Line ends before the next spot, consume the chunk and go on
			if (nextNewLine > lastUsed) {
				lines[currentLine].push(code.substring(lastUsed, nextNewLine));
			}
			// Increment pointers
			lastUsed = nextNewLine + 1;
			nextNewLine = code.indexOf("\n", lastUsed);
			currentLine += 1;
			if (nextNewLine === -1) {
				// No more new lines, let other spot be processed
				if (nextSpot === Infinity) {
					// No more spot, no more text, eat the rest of the code
					if (lastUsed < code.length && nextSpot === Infinity) {
						lines[currentLine] = [];
						lines[currentLine] = [code.substring(lastUsed)];
					}
					break;
				} else {
					// Still few other spots
					lines[currentLine] = [];
					nextNewLine = Infinity;
				}
			} else {
				lines[currentLine] = [];
			}
		}
	} while (true);
	// I claim that it'll eventually stop

	return {
		original : lines,
		beauty : highlightBeauty(tree.code)
	};
};

sortSpots = function (tree) {
	var result = [];
	var types = {
		lines : "s",
		conditions : "c",
		functions : "f"
	};

	Object.keys(types).forEach(function (type) {
		tree[type].forEach(function (id) {
			var details = id.split("_");
			var end = parseInt(details[details.length - 1], 10);
			var start = parseInt(details[details.length - 2], 10);
			var line = parseInt(details[details.length - 3], 10);

			result.push({
				id : id,
				type : types[type] + "b",
				position : start
			});
			result.push({
				id : id,
				type : types[type] + "e",
				position : end
			});
		});
	});

	return result.sort(function (first, second) {
		if (first.position === second.position) {
			// I prefer having ends before new beginning
			return first.type.charAt(1) === "e" ? -1 : 1;
		}

		return first.position - second.position;
	});
}

var regStatement = /\$\$_l\("[^"]+",\s?"([^"]+)"\);/g;
var regCondition = /\$\$_c\("[^"]+",\s?"([^"]+)",\s?/g;
var regFunction = /\$\$_f\("[^"]+",\s?"([^"]+)",\s?"([^"]+)"\);/g;
function highlightBeauty (code) {
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
				result.fns[fnMatch[2]] = mapped.length - 1;
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