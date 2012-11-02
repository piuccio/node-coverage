Aria.tplScriptDefinition({
	$classpath : "views.admin.ListReportsScript",
	$prototype : {
		$beforeRefresh : function (section) {
			if (!section || !section.outputSection) {
				var sortDirection = aria.templates.View.SORT_DESCENDING;
				this.reports.setSort(sortDirection, "time", this.getSortMethod("time"));
			}
		},

		getReport : function (evt, url) {
			evt.preventDefault(true);

			this.moduleCtrl.navigate(evt.target.getData("href"));
		},

		getSortMethod : function (key) {
			return function (object) {
				return object.value[key];
			};
		},

		sort : function (evt, args) {
			var what = args.what;
			var view = args.view;

			evt.preventDefault(true);

			view.toggleSortOrder(what, this.getSortMethod(what));
			view.refresh();
			this.$refresh({
				outputSection : "table"
			});
		},
	}
});