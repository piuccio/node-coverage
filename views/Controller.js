Aria.classDefinition({
	$classpath : "views.Controller",
	$extends : "aria.templates.ModuleCtrl",
	$implements : ["views.IController"],
	$dependencies : ["aria.utils.Path", "aria.utils.Event"],
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
			},
			"stats" : {
				defaultTemplate : "views.stats.Statistics",
				moduleCtrl : {
					classpath : "views.stats.Controller"
				},
				block : true
			}
		},

		_statesRegexp : /^\/([^\/]+)\/(.*)/,

		_currentState : "_no_state_",

		init : function (evt, callback) {
			if (history) {
				this.popstateCallback = {
					fn : this.onPopstate,
					scope : this
				};
				aria.utils.Event.addListener(window, "popstate", this.popstateCallback);
			}
			this.transition(window.location.pathname, callback);
		},

		popstateCallback : null,

		/**
		 * Perform a state transition according to the url.
		 * This will load the required submodule
		 *
		 * @param {String} url Where to go
		 * @param {aria.core.CfgBeans.Callback} callback Called when module is lodaed
		 */
		transition : function (url, callback) {
			var next = this.parseUrl(url);

			var state = this._states[next.action];
			if (!state) {
				next.action = "default";
				state = this._states[next.action];
			}

			this._currentState = next.action;

			if (state.moduleCtrl.classpath) {
				var nextModule = state.moduleCtrl.classpath;
				this.loadSubModules([{
					classpath : nextModule,
					refpath : nextModule,
					initArgs : next
				}], {
					fn : this.onModuleLoad,
					scope : this,
					args : {
						state : this._currentState,
						module : nextModule,
						callback : callback
					}
				});
			} else {
				// module already loaded
				this.onModuleLoad({
					errors : 0
				}, {
					state : this._currentState,
					module : state.moduleCtrl,
					callback : callback,
					initArgs : next
				});
			}
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
				this._data.error = true;
				this.$logError("Error in module initialization");
			}

			if (aria.utils.Type.isString(args.module)) {
				this._states[args.state].moduleCtrl = aria.utils.Path.resolve(args.module, this);

				this.$callback(args.callback);
			} else {
				this._states[args.state].moduleCtrl = args.module;

				this._states[args.state].moduleCtrl.updateState(args.initArgs, args.callback);
			}
		},

		getModule : function () {
			return this._states[this._currentState] || this._states["default"];
		},

		getLocation : function () {
			return this.getModule().moduleCtrl.getData().location || "";
		},

		onSubModuleEvent : function (evt) {
			if (evt.name === "navigate") {
				if (history) {
					this.transition(evt.url, {
						fn : function (url) {
							history.pushState(null, null, url);

							this.$raiseEvent({
								name : "stateChange"
							});
						},
						scope : this,
						args : evt.url,
						resIndex : -1
					});
				} else {
					window.location = url;
				}
			}
		},

		onPopstate : function (evt) {
			var url = window.location.pathname;
			this.transition(url, {
				fn : function () {
					this.$raiseEvent({
						name : "stateChange"
					});
				},
				scope : this
			});
		}
	}
});