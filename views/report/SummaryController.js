Aria.classDefinition({
	$classpath : "views.report.SummaryController",
	$extends : "views.lib.BaseController",
	$implements : ["views.report.ISummaryController"],
	$dependencies : ["aria.utils.Array"],
	$prototype : {
		$publicInterfaceName : "views.report.ISummaryController",

		getAction : function () {
			var request = this._data.request.split("/");

			this._data.action = {
				name : request[1] || "all",
				args : this.decodeReportName(request[2])
			};

			return "/json/report/" + request[0];
		},

		parseResponse : function (coverage) {
			this._data.reportName = coverage.name;

			if (!this._data.coverage) {
				this._data.coverage = {};
			}
			
			this._data.coverage[coverage.name] = coverage;

			this.sameAction();
		},

		sameAction : function (callback) {
			var coverage = this._data.coverage[this._data.reportName];

			if (this._data.action.name === "all") {
				this._data.report = coverage["global"];

				this._data.location = coverage.name;
			} else if (this._data.action.name === "file") {
				var name = this._data.action.args;
				this._data.location = name;
				this._data.report = coverage.files[name];
			}

			this.$callback(callback);
		},

		getFileUrl : function (name) {
			return "/report/" + this._data.reportName + "/file/" + this.encodeReportName(name);
		}
	}
});