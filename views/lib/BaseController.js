Aria.classDefinition({
	$classpath : "views.lib.BaseController",
	$extends : "aria.templates.ModuleCtrl",
	$implements : ["views.lib.IBaseController"],
	$prototype : {
		$publicInterfaceName : "views.lib.IBaseController",

		lastAction : "_no_action_",

		/**
		 * Default init implementation, it makes a json request to the server
		 * targetting the action returned by this.getAction
		 */
		init : function (initArgs, callback) {
			this._data = {
				error : false,
				request : initArgs.args
			};

			this.callAction(initArgs, callback);
		},

		callAction : function (initArgs, callback) {
			var action = this.getAction();

			if (action !== this.lastAction) {
				this.lastAction = action;

				aria.core.IO.asyncRequest({
					url : action,
					callback : {
						fn : this._requestSuccess,
						scope : this,
						onerror : this._requestError,
						args : callback
					},
					expectedResponseType : "json"
				});
			} else {
				this.sameAction(callback);
			}
		},

		_requestSuccess : function (resources, initCb) {
			this.parseResponse(resources.responseJSON);

			this.$callback(initCb);
		},

		_requestError : function (resources, initCb) {
			this._data.error = true;

			this.$callback(initCb);
		},

		getAction : Aria.empty,

		parseResponse : Aria.empty,

		navigate : function (url) {
			this.$raiseEvent({
				name : "navigate",
				url : url
			});
		},

		updateState : function (initArgs, callback) {
			this.json.setValue(this._data, "request", initArgs.args);

			this.callAction(initArgs, callback);
		},

		sameAction : function (callback) {
			this.$callback(callback);
		}
	}
});