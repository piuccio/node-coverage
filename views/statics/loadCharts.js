$(document).ready(function () {
	var report = __report;
	if (!__report) {
		return;
	}

	for (var length in report.byPackage) {
		if (report.byPackage.hasOwnProperty(length)) {
			var packageReport = report.byPackage[length];

			var chartInfo = {
				chart: {
					renderTo: 'package' + length
				},
				title: {
					text: 'Unused lines of code by package'
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
					name: 'Unused code',
					data: []
				}]
			};

			for (var file in packageReport) {
				if (packageReport.hasOwnProperty(file)) {
					chartInfo.series[0].data.push([file, packageReport[file]])
				}
			}

			new Highcharts.Chart(chartInfo);
		}
	}
});