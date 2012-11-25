Aria.classDefinition({
	$classpath : "views.stats.Controller",
	$extends : "views.lib.BaseController",
	$dependencies : ["aria.utils.ScriptLoader"],
	$prototype : {
		getAction : function () {
			// I just hope it's going to be quick
			aria.utils.ScriptLoader.load([
				"/views/statics/jQuery/jquery.min.js"
			], {
				fn : function () {
					aria.utils.ScriptLoader.load([
						"/views/statics/highcharts/highcharts.js"
					]);
				},
				scope : this
			});

			this._data.reportName = this._data.request;
			this._data.location = "Stats & Graphs - " + this._data.request;

			return "/json/stat/" + this._data.request;
		},

		parseResponse : function (statistics) {
			if (!this._data.statistics) {
				this._data.statistics = {};
			}
			
			this._data.statistics[this._data.reportName] = statistics;

			this.sameAction();
		}
	}
});