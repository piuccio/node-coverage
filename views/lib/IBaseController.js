Aria.interfaceDefinition({
	$classpath : "views.lib.IBaseController",
	$extends : "aria.templates.IModuleCtrl",
	$events : {
		"navigate" : "Raised when the user navigates to a different page"
	},
	$interface : {
		navigate : {
			$type : "Function"
		}
	}
});