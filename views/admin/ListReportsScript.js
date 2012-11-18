Aria.tplScriptDefinition({
	$classpath : "views.admin.ListReportsScript",
	$prototype : {
		/**
		 * Before doing the initial refresh we initialize the view to be sorted
		 * @param  {Object} section
		 */
		$beforeRefresh : function (section) {
			if (!section || !section.outputSection) {
				var sortDirection = aria.templates.View.SORT_DESCENDING;
				this.reports.setSort(sortDirection, "time", this.getSortMethod("time"));
			}
		},

		/**
		 * Return a sort function to be used by the view
		 * @param  {String} key Primary key for sorting
		 * @return {Function}
		 */
		getSortMethod : function (key) {
			return function (object) {
				return object.value[key];
			};
		},

		getReport : function (evt, url) {
			evt.preventDefault(true);

			this.moduleCtrl.navigate(evt.target.getData("href"));
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

		selectReport : function (evt, report) {
			var container = this.meta.selection;
			if (evt.target.getProperty("checked")) {
				this.$json.add(container, report);
			} else {
				this.$json.removeAt(container, aria.utils.Array.indexOf(container, report));
			}
		},

		merge : function (evt, selection) {
			evt.preventDefault(true);

			var array = [];
			aria.utils.Array.forEach(selection, function (report) {
				array.push(report.id);
			});

			this.moduleCtrl.merge(array);
		},

		getErrorMessage : function (error) {
			error = error || this.locale.GENERIC_ERROR;

			var lines = error.split("\n");

			var max = 0, messages = [], pad = function (text, length) {
				return text + (new Array(length - text.length + 1)).join(" ");
			};

			if (lines.length === 1) {
				max = error.length;
				messages.push("&lt; ", error, " &gt;\n");
			} else {
				for (var i = 0, len = lines.length; i < len; i += 1) {
					if (lines[i].length > max) {
						max = lines[i].length;
					}
				}

				for (var i = 0, len = lines.length; i < len; i += 1) {
					var delimiters = ["|", "|"];

					if (i === 0) {
						delimiters = ["/", "\\"];
					} else if (i === len - 1) {
						delimiters = ["\\", "/"];
					}

					messages.push(delimiters[0], " ", pad(lines[i], max), " ", delimiters[1], "\n");
				}
			}

			var borders = new Array(max + 3);

			var msg = " " + borders.join("_") + " \n" + messages.join("") + " " + borders.join("-") + " \n";

			return msg;
		}
	}
});