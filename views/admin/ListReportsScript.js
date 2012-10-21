Aria.tplScriptDefinition({
	$classpath : "views.admin.ListReportsScript",
	$prototype : {
		getReport : function (evt, url) {
			evt.preventDefault(true);

			this.moduleCtrl.navigate(evt.target.getData("href"));
		}
	}
});