var fileUtil = require("./file");

/**
 * Add coverage information on top of the original file code.
 *
 * @param {Object} report Coverage report of a given file
 *
 * @return {String} source code with extra markup
 */
module.exports = function (report) {
	// As far as I understood, that's how Uglify handles new lines
	code = fileUtil.normalizeNewLines(report.code);

	var spots = sortSpots(report);
	while (spots.length) {
		var spot = spots.pop();
		code = code.substring(0, spot.position) + getMarkup(spot) + code.substring(spot.position);
	}
	return code;
}

function getMarkup (spot) {
	if (spot.covered) {
		return "";
	}
	if (spot.begin) {
		var classes = [spot.type, "not-covered"];
		if (!spot.coveredTrue) {
			classes.push("missing-true");
		}
		if (!spot.coveredFalse) {
			classes.push("missing-false");
		}
		return "<span class='" + classes.join(" ") + "'>";
	} else {
		return "</span>";
	}
	return code;
};

sortSpots = function (report) {
	var result = [];

	["statements", "functions"].forEach(function (type) {
		var all = report[type].detail;
		for (var id in all) {
			var details = id.split("_");
			var end = parseInt(details[details.length - 1], 10);
			var start = parseInt(details[details.length - 2], 10);
			var line = parseInt(details[details.length - 3], 10);

			result.push({
				id: id,
				type: type,
				position: start,
				begin: true,
				covered: all[id] > 0,
				coveredTrue: true,
				coveredFalse: true
			});
			result.push({
				id: id,
				type: type,
				position: end,
				begin: false,
				covered: all[id] > 0,
				coveredTrue: true,
				coveredFalse: true
			});
		}
	});
	["conditions"].forEach(function (type) {
		var all = report[type].detail.all;
		for (var id in all) {
			var details = id.split("_");
			var end = parseInt(details[details.length - 1], 10);
			var start = parseInt(details[details.length - 2], 10);
			var line = parseInt(details[details.length - 3], 10);

			result.push({
				id: id,
				type: type,
				position: start,
				begin: true,
				covered: all[id]["true"] > 0 && all[id]["false"] > 0,
				coveredTrue: all[id]["true"] > 0,
				coveredFalse: all[id]["false"] > 0
			});
			result.push({
				id: id,
				type: type,
				position: end,
				begin: false,
				covered: all[id]["true"] > 0 && all[id]["false"] > 0,
				coveredTrue: all[id]["true"] > 0,
				coveredFalse: all[id]["false"] > 0
			});
		}
	});

	return result.sort(function (first, second) {
		if (first.position === second.position) {
			// I prefer having ends before new beginning
			if (first.begin === second.begin) {
				return 0;
			}
			return first.begin ? -1 : 1;
		}

		return first.position - second.position;
	});
}
