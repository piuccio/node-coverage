var fileContent = require("./fileContent");
var Q = require("q");
/**
 * Generate statistics from a given report.
 *
 * The return object contains
 *
 * unused
 *     total : Total number of unused statements
 *     byFile : Map a file name with the number of unused statements in that file
 *     byPackage : Map
 *         [count] : Map [count] is a number corresponding to the package's size
 *             [packageName] : number of unused statements
 *
 * @param  {Object} report @see report.generate
 * @param  {Function} callback Callback receiving the statistics
 */
exports.getStats = function (report, callback) {
	var unused = {};
	var totalUnused = 0;
	var content = {};
	var allFiles = Object.keys(report.files);

	var packages = exports.generatePackages(
		allFiles,
		function (fileName) {
			var missingLines = countUnused(report, fileName);

			unused[fileName] = missingLines;
			totalUnused += missingLines;
		}
	);

	sizeByPackage(report, allFiles, packages, function (size) {
		callback({
			unused : {
				total : totalUnused,
				byFile : unused,
				byPackage : unusedByPackage(report, unused, packages)
			},
			coverage : {
				statements : coveredPackages(report, packages)
			},
			size : size
		});
	});
};

exports.generatePackages = function generatePackages (files /*, ...callbacks*/) {
	var packages = {}, max = 0;
	var callbacks = Array.prototype.slice.call(arguments, 1);

	// build a packages tree
	files.forEach(function (fileName) {
		callbacks.forEach(function (cb) {
			cb.call(null, fileName);
		});

		var tokens;
		if (fileName.charAt(0) === "/") {
			tokens = fileName.substring(1).split("/");
		} else {
			tokens = fileName.split("/");
		}

		var holder = packages;
		for (var i = 0; i < tokens.length; i += 1) {
			if (!holder[tokens[i]]) {
				holder[tokens[i]] = {
					files : [],
					packages : {}
				};
			}
			holder[tokens[i]].files.push(fileName);
			holder = holder[tokens[i]].packages;
		}
		max = Math.max(max, tokens.length);
	});

	// make it flat
	var flat = {};
	for (var i = 0; i < max; i += 1) {
		flat[i] = {};
	}
	flatten(packages, "", flat, 0, max);

	return flat;
};

function flatten (object, prefix, result, count, max) {
	for (var key in object) {
		var name = prefix + "/" + key;

		result[count][name] = object[key].files;

		if (Object.keys(object[key].packages).length === 0) {
			// end of package, iterate till max
			for (var i = count + 1; i < max; i += 1) {
				result[i][name] = object[key].files;
			}
		} else {
			flatten(object[key].packages, name, result, count + 1, max);
		}
	}
};


function unusedByPackage (report, unused, packages) {
	var result = {};

	for (var count in packages) {
		result[count] = {};

		for (var name in packages[count]) {
			result[count][name] = 0;

			packages[count][name].forEach(function (fileName) {
				var missingLines = countUnused(report, fileName);

				result[count][name] += missingLines;
			});
		}
	}


	return result;
}

function countUnused (report, fileName) {
	var fileReport = report.files[fileName].statements;
	return fileReport.total - fileReport.covered;
}

function coveredPackages (report, packages) {
	var result = {};

	for (var count in packages) {
		result[count] = {};

		for (var name in packages[count]) {
			var totalLines = 0;
			var coveredLines = 0;

			packages[count][name].forEach(function (fileName) {
				totalLines += report.files[fileName].statements.total;
				coveredLines += report.files[fileName].statements.covered;
			});

			result[count][name] = coveredLines / totalLines;
		}
	}


	return result;
}

function sizeByPackage (report, allFiles, packages, callback) {
	var allSize = {};

	allFiles.reduce(function (working, file) {
		return working.then(getSize.bind(null, file, report.files[file], allSize));
	}, Q.resolve(allFiles)).then(function () {
		// callback when all are resolved

		var result = {};
		for (var count in packages) {
			result[count] = {};

			for (var name in packages[count]) {
				var totalOriginal = 0;
				var totalCovered = 0;

				packages[count][name].forEach(function (fileName) {
					totalOriginal += allSize[fileName].original;
					totalCovered += allSize[fileName].covered;
				});

				result[count][name] = {
					original : totalOriginal,
					covered : totalCovered
				};
			}
		}

		callback(result);
	});
}

/**
 * Get a deferred for a single file size
 */
function getSize (file, fileReport, result) {
	result[file] = {
		original : NaN,
		covered : NaN
	};

	var deferred = Q.defer();
	fileContent.getFullSize(fileReport, function (originalSize) {
		result[file].original = originalSize;

		fileContent.getCoveredSize(fileReport, function (coveredSize) {
			result[file].covered = coveredSize;

			deferred.resolve(result);
		});
	});

	return deferred.promise;
}