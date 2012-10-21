Aria.classDefinition({
	$classpath : "views.admin.ReportsController",
	$extends : "views.lib.BaseController",
	$dependencies : ["aria.utils.Array"],
	$prototype : {

		getAction : function () {
			return "/json/all"
		},
		
		parseResponse : function (reports) {
			this._data.reports = [];
			var results = this._data.reports;
			aria.utils.Array.forEach(reports, function (report) {
				var displayName = report.id.substring(0, report.id.lastIndexOf("_"));
				
				results.push({
					name : displayName,
					id : report.id,
					time : report.time,
					date : report.date
				});
			});
		}
	}
});