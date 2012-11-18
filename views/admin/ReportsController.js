Aria.classDefinition({
	$classpath : "views.admin.ReportsController",
	$extends : "views.lib.BaseController",
	$implements : ["views.admin.IReportsController"],
	$dependencies : ["aria.utils.Array", "aria.utils.json.JsonSerializer"],
	$res : {
		locale : "views.lib.Locale"
	},
	$prototype : {
		$publicInterfaceName : "views.admin.IReportsController",

		getAction : function () {
			return "/json/all"
		},
		
		parseResponse : function (data) {
			var reports = data.reports;

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

			this._data.conf = data.conf;
		},

		serializer : new aria.utils.json.JsonSerializer(),

		/**
		 * Merge a list of reports
		 * @param  {Array} selection List of report ids
		 */
		merge : function (selection) {
			aria.core.IO.asyncRequest({
				url : "/merge",
				method : "POST",
				data : this.serializer.serialize(selection),
				headers : {
					"Content-Type" : "application/json"
				},
				callback : {
					fn : this.onMerge,
					scope : this,
					onerror : this.onMerge
				}
			});
		},

		/**
		 * Callback for the async request
		 * @param  {aria.core.CfgBeans.IOAsyncRequestResponseCfg} response Server response
		 */
		onMerge : function (response) {
			if (response.status !== 200) {
				var msg = aria.utils.String.substitute(views.lib.Locale.MERGE_ERROR, [response.status, response.responseText]);
				this.json.setValue(this._data, "error", msg);
			} else {
				var newReportName = response.responseText;
				this.navigate("/report/" + newReportName);
			}
		}
	}
});