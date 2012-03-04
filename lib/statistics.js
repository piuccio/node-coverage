function iterateOnReport (report, callback) {
	for (var fileName in report.files) {
		callback.call(this, fileName, report.files[fileName].statements);
	}
}

function normalize (container, count, partial) {
	if (!container[count]) {
		container[count] = {};
	}

	if (!container[count][partial]) {
		container[count][partial] = 0;
	}
}

function statistics (report) {
	var totalUnusedCode = 0;
	var unused = {};
	var unusedByPackage = {};
	var maxPackage = 0;

	iterateOnReport(report, function (fileName, fileReport) {
		var missingLines = fileReport.total - fileReport.covered;

		unused[fileName] = missingLines;
		totalUnusedCode += unused[fileName];

		var packages = fileName.split("/");
		maxPackage = Math.max(maxPackage, packages.length);
	});

	//second loop becose I was missing maxPackage
	iterateOnReport(report, function (fileName, fileReport) {
		var missingLines = fileReport.total - fileReport.covered;

		var packages = fileName.split("/");

		packages.forEach(function (folder, count) {
			if (!folder) {
				// because count = 0 is the first /
				return;
			}

			var partial = packages.slice(0, count + 1).join("/");

			normalize(unusedByPackage, count, partial);

			unusedByPackage[count][partial] += missingLines;
		});

		// add it also on higher packages
		for (var i = packages.length; i < maxPackage; i += 1) {
			normalize(unusedByPackage, i, fileName);

			unusedByPackage[i][fileName] += missingLines;
		}
	});

	return {
		unused : totalUnusedCode,
		byFile : unused,
		byPackage : unusedByPackage
	};
}

module.exports = statistics;