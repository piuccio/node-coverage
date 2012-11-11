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
					return object.initIndex;
				};
			}

			return function (object) {
				// format the number and use the file as second key
				var percentage = object.value[key].percentage;
				return aria.utils.Number.formatNumber(percentage, "000.00") + object.initIndex;
			};
		},

		getFile : function (evt) {
			evt.preventDefault(true);

			var href = evt.target.getData("href");

			this.moduleCtrl.navigate(href);
		},

		isCovered : function (id) {
			if (id in this.data.report.statements.detail) {
				return this.data.report.statements.detail[id] > 0;
			} else {
				// it's not a line of code
				return true;
			}
		},

		isChecked : function (id) {
			var details = this.data.report.conditions.detail.all;
			return details[id]["true"] > 0 && details[id]["false"] > 0;
		},

		/* Methods for the beauty code */

		getLineCount : function (loc) {
			var id = loc.l || loc.id;

			if (id) {
				return this.data.report.statements.detail[id];
			}

			return "";
		},

		getMissingCondition : function (loc) {
			var missing = {
				"true" : [],
				"false" : [],
				partially : false,
				covered : this.isCovered(loc.l)
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

		/* Methods for the original code */

		isNodeBegin : function (node) {
			return node.type.charAt(1) === "b";
		},

		getNodeClass : function (node) {
			var classes = ["node"];

			switch (node.type.charAt(0)) {
				case "s":
					classes.push("statement");
					if (!this.isCovered(node.id)) {
						classes.push("not");
					}
					break;
				case "f":
					classes.push("function");
					break;
				case "c":
					classes.push("condition");
					if (!this.isChecked(node.id)) {
						classes.push("not");
					}
					break;
				default:
					return "";
			}

			return classes.join(" ");
		},

		getPartialCondition : function (node) {
			var details = this.data.report.conditions.detail.all;

			var isEverTrue = details[node.id]["true"] > 0;
			var isEverFalse = details[node.id]["false"] > 0;
			if (isEverTrue && isEverFalse) {
				return "";
			} else if (!isEverTrue && !isEverFalse) {
				return "";
			} else if (isEverTrue) {
				return "true";
			} else {
				return "false";
			}
		}
	}
});