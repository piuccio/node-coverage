Aria.tplScriptDefinition({
	$classpath : "views.stats.StatisticsScript",
	$dependencies : ["aria.utils.Number", "aria.utils.Object"],
	$prototype : {
		$afterRefresh : function () {
			var div = "chart_" + this.meta.package;

			if (this.meta.selected === "unused") {
				this.loadUnusedChart(div);
			} else if (this.meta.selected === "size") {
				this.loadSizeChart(div);
			} else if (this.meta.selected === "coverage") {
				this.loadCoverageChart(div);
			}
		},

		loadUnusedChart : function (to) {
			var packageReport = this.data.statistics[this.data.reportName].unused.byPackage[this.meta.package];

			var chartInfo = {
				chart: {
					renderTo: to
				},
				title: {
					text: this.locale.STATS_UNUSED_BY_PACKAGE
				},
				tooltip: {
					formatter: function() {
						return '<b>'+ this.key +'</b>: '+ this.percentage.toFixed(2) +' %';
					}
				},
				plotOptions: {
					pie: {
						allowPointSelect: false,
						cursor: 'pointer',
						dataLabels: {
							enabled: true,
							color: '#000000',
							connectorColor: '#000000',
							formatter: function() {
								return '<b>'+ this.key +'</b>: '+ this.percentage.toFixed(2) +' %';
							}
						}
					}
				},
				series: [{
					type: 'pie',
					name: this.locale.STATS_UNUSED,
					data: []
				}]
			};

			for (var file in packageReport) {
				if (packageReport.hasOwnProperty(file)) {
					chartInfo.series[0].data.push([file, packageReport[file]]);
				}
			}

			new Highcharts.Chart(chartInfo);
		},

		loadSizeChart : function (to) {
			var tplScript = this;
			var packageReport = this.data.statistics[this.data.reportName].size[this.meta.package];

			var chartInfo = {
				chart: {
					renderTo: to,
					type : "area"
				},
				title: {
					text: this.locale.STATS_SIZE
				},
				legend : {
					layout : "vertical",
					align : "right",
					verticalAlign : "top",
					floating : true,
					borderWidth : 1,
					backgroundColor: "#FFFFFF"
				},
				xAxis : {
					categories : aria.utils.Object.keys(packageReport),
					labels : {
						rotation : 30,
						y : 40,
						x : 40
					}
				},
				yAxis : {
					labels : {
						formatter : function () {
							return tplScript.formatSize(this.value);
						}
					}
				},
				tooltip: {
					formatter: function() {
						return '<b>'+ this.key +'</b>: ' + tplScript.formatSize(this.y);
					}
				},
				plotOptions: {
					area : {
						fillOpacity : 0.5
					}
				},
				series: [{
					name : this.locale.STATS_SIZE_ORIGINAL_SHORT,
					data : []
				}, {
					name : this.locale.STATS_SIZE_COVERED_SHORT,
					data : []
				}]
			};

			for (var file in packageReport) {
				if (packageReport.hasOwnProperty(file)) {
					chartInfo.series[0].data.push(packageReport[file].original);
					chartInfo.series[1].data.push(packageReport[file].covered);
				}
			}

			new Highcharts.Chart(chartInfo);
		},

		loadCoverageChart : function (to) {
			var tplScript = this;
			var packageReport = this.data.statistics[this.data.reportName].coverage.statements[this.meta.package];

			var chartInfo = {
				chart: {
					renderTo: to,
					type : "area"
				},
				title: {
					text: this.locale.STATS_COVERAGE
				},
				xAxis : {
					categories : aria.utils.Object.keys(packageReport),
					labels : {
						rotation : 30,
						y : 40,
						x : 40
					}
				},
				yAxis : {
					labels : {
						formatter : function () {
							return this.value + "%";
						}
					}
				},
				tooltip: {
					formatter: function() {
						return '<b>'+ this.key +'</b>: ' + this.y.toFixed(2) + '%';
					}
				},
				plotOptions: {
					area : {
						fillOpacity : 0.5
					}
				},
				series: [{
					name : this.locale.STATS_COVERAGE,
					data : []
				}]
			};

			for (var file in packageReport) {
				if (packageReport.hasOwnProperty(file)) {
					chartInfo.series[0].data.push(100.0 * packageReport[file]);
				}
			}

			new Highcharts.Chart(chartInfo);
		},

		formatSize : function (bytes) {
			if (bytes == null) {
				return "ERROR";
			}

			var unit = "B";
			var size = bytes;

			if (size > 1000) {
				size = size / 1024;
				unit = "KB";

				if (size > 1000) {
					size = size / 1024;
					unit = "MB";
				}
			}
			return aria.utils.Number.formatNumber(size, "0.##") + " " + unit;
		}
	}
});