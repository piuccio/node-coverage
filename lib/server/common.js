var path = require("path");

exports.createReportName = function (desiredName) {
	var now = new Date();

	var name = "report";
	if (desiredName) {
		desiredName = path.basename(desiredName);

		if (desiredName.charAt(0) !== ".") {
			name = desiredName;
		}
	}
	
	return name + "_" + now.getTime() + ".json";
};