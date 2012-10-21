Aria.interfaceDefinition({
	$classpath : "views.IController",
	$extends : "aria.templates.IModuleCtrl",
	$events : {
		"stateChange" : "Raise when the controller's state changes"
	},
	$interface : {
		getModule : {
			$type : "Function"
		},

		getLocation : {
			$type : "Function"
		}
	}
})