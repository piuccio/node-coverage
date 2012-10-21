Aria.classDefinition({
	$classpath : "views.report.SummaryController",
	$extends : "views.lib.BaseController",
	$dependencies : ["aria.utils.Array"],
	$prototype : {
		getAction : function () {
			var request = this._data.request.split("/");

			this._data.action = {
				name : request[1] || "all",
				args : request[2] || ""
			};

			return "/json/report/" + request[0];
		},

		parseResponse : function (coverage) {
			this._data.reportName = coverage.name;

			if (!this._data.coverage) {
				this._data.coverage = {};
			}
			
			this._data.coverage[coverage.name] = coverage;

			if (this._data.action.name === "all") {
				this._data.report = coverage["global"];

				this._data.location = coverage.name;
			} else if (this._data.action.name === "file") {
				var fileName = this._data.action.args.replace(/%2F/g, "/");
				this._data.location = fileName;

				for (var i = 0, len = coverage.files.length; i < len; i += 1) {
					if (coverage.files[i].file === fileName) {
						this._data.report = coverage.files[i].report;
						break;
					}
				}
			}
		}
	}
});