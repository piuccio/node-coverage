Aria.tplScriptDefinition({
	$classpath : "views.LayoutScript",
	$prototype : {
		onModuleEvent : function (evt) {
			if (evt.name === "stateChange") {
				this.$refresh();
			}
		},

		$afterRefresh : function () {
			this.$getElementById("header").scrollIntoView(true);
		}
	}
});