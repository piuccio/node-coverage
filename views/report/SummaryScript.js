Aria.tplScriptDefinition({
	$classpath : "views.report.SummaryScript",
	$dependencies : ["aria.utils.Number"],
	$prototype : {
		formatNumber : function (value, position) {
			return value.toFixed(position);
		},

		getClass : function (percentage) {
			if (percentage < 30) {
				return "low";
			} else if (percentage > 80) {
				return "high";
			} else {
				return "notbad";
			}
		},

		initView : function (view) {
			var sortDirection = aria.templates.View.SORT_ASCENDING;
			view.setSort(sortDirection, "file", this.getSortMethod("file"));
		},

		sort : function (evt, args) {
			var what = args.what;
			var view = args.view;

			evt.preventDefault(true);

			view.toggleSortOrder(what, this.getSortMethod(what));
			view.refresh();
			this.$refresh({
				outputSection : "content"
			});
		},

		getSortMethod : function (key) {
			if (key === "file") {
				return function (object) {
					return object.value.file;
				};
			}
			
			return function (object) {
				// format the number and use the file as second key
				var percentage = object.value.report[key].percentage;
				return aria.utils.Number.formatNumber(percentage, "000.00") + object.value.file;
			};
		},

		isCovered : function (loc) {
			if (loc.l) {
				return this.data.report.statements.detail[loc.l] > 0;
			} else {
				return true;
			}
		},

		getLineCount : function (loc) {
			if (loc.l) {
				return this.data.report.statements.detail[loc.l];
			}

			return "";
		},

		getMissingCondition : function (loc) {
			var missing = {
				"true" : [],
				"false" : [],
				partially : false,
				covered : this.isCovered(loc)
			};

			var array = aria.utils.Array;
			var details = this.data.report.conditions.detail.all;

			if (loc.c && missing.covered) {
				array.forEach(loc.c, function (condition, index) {
					if (details[condition]["true"] === 0) {
						missing["true"].push(index + 1);
						missing.partially = true;
					} else if (details[condition]["false"] === 0) {
						missing["false"].push(index + 1);
						missing.partially = true;
					}
				});
			}

			var className = "";
			if (missing.partially) {
				className = "partially-covered";
			} else if (!missing.covered) {
				className = "not-covered";
			}

			return {
				"true" : missing["true"].join(", "),
				"false" : missing["false"].join(", "),
				"class" : className
			};
		},

		getFile : function (evt) {
			evt.preventDefault(true);

			var href = evt.target.getData("href");

			this.moduleCtrl.navigate(href);
		}
	}
});