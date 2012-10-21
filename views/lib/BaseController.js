Aria.classDefinition({
	$classpath : "views.lib.BaseController",
	$extends : "aria.templates.ModuleCtrl",
	$implements : ["views.lib.IBaseController"],
	$prototype : {
		$publicInterfaceName : "views.lib.IBaseController",

		/**
		 * Default init implementation, it makes a json request to the server
		 * targetting the action returned by this.getAction
		 */
		init : function (initArgs, callback) {
			this._data = {
				error : false,
				request : initArgs.args
			};

			aria.core.IO.asyncRequest({
				url : this.getAction(),
				callback : {
					fn : this._requestSuccess,
					scope : this,
					onerror : this._requestError,
					args : callback
				},
				expectedResponseType : "json"
			});
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
			if (history) {
				window.location = url;
			} else {
				window.location = url;
			}
		}
	}
});