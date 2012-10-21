Aria.classDefinition({
	$classpath : "views.Controller",
	$extends : "aria.templates.ModuleCtrl",
	$implements : ["views.IController"],
	$dependencies : ["aria.utils.Path"],
	$prototype : {
		$publicInterfaceName : "views.IController",

		_states : {
			"default" : {
				defaultTemplate : "views.admin.ListReports",
				moduleCtrl : {
					classpath : "views.admin.ReportsController"
				},
				block : true
			},
			"report" : {
				defaultTemplate : "views.report.Summary",
				moduleCtrl : {
					classpath : "views.report.SummaryController"
				},
				block : true
			}
		},

		_statesRegexp : /^\/([^\/]+)\/(.*)/,

		_currentState : "default",

		/**
		 * Load the default module controller
		 */
		init : function (evt, callback) {
			var next = this.parseUrl(window.location.pathname);

			var state = this._states[next.action];
			if (!state) {
				next.action = "default";
				state = this._states[next.action];
			}
			this._currentState = next.action;

			var defaultModule = state.moduleCtrl.classpath;
			this.loadSubModules([{
				classpath : defaultModule,
				refpath : defaultModule,
				initArgs : next
			}], {
				fn : this.onModuleLoad,
				scope : this,
				args : {
					state : this._currentState,
					module : defaultModule,
					callback : callback
				}
			});
		},

		parseUrl : function (path) {
			var match = path.match(this._statesRegexp);

			if (match) {
				return {
					action : match[1],
					args : match[2]
				};
			} else {
				return {
					action : "default"
				};
			}
		},

		onModuleLoad : function (evt, args) {
			if (evt.errors) {
				// TODO what to do ?
			}

			this._states[args.state].moduleCtrl = aria.utils.Path.resolve(args.module, this);

			this.$callback(args.callback);
		},

		getModule : function () {
			return this._states[this._currentState] || this._states["default"];
		},

		getLocation : function () {
			return this.getModule().moduleCtrl.getData().location || "";
		}
	}
});