{Template {
	$classpath : "views.stats.Statistics",
	$css : ["views.stats.Style"],
	$res : {
		locale : "views.lib.Locale"
	},
	$hasScript : true
}}

{var meta = {
	selected : "coverage",
	package : 0
}/}

{macro main()}
<div class="content graphContainer">
	<div class="categories" {on click {
		fn : function (evt) {
			this.$json.setValue(meta, "selected", evt.target.getData("name", true) || meta.selected);
		}, scope : this
	}/} data-name="">
		{section {
			type : "ul",
			bindRefreshTo : [{
				inside : meta,
				to : "selected"
			}],
			macro : "categories"
		}/}
	</div>
	<div class="charts" {on click {
		fn : function (evt) {
			this.$json.setValue(meta, "package", evt.target.getData("package", true) || meta.package);
		}, scope : this
	}/} data-package="">
		{section {
			type : "div",
			macro : "content",
			bindRefreshTo : [{
				inside : meta
			}]
		}/}
	</div>
	<div class="clear">&nbsp;</div>
</div>
{/macro}

{macro categories()}
<ul>
	<li data-name="coverage" {if meta.selected === "coverage"}class="selected"{/if}>${locale.STATS_COVERAGE}</li>
	<li data-name="unused" {if meta.selected === "unused"}class="selected"{/if}>${locale.STATS_UNUSED}</li>
	<li data-name="size" {if meta.selected === "size"}class="selected"{/if}>${locale.STATS_SIZE}</li>
</ul>
{/macro}

{macro content()}
{if meta.selected === "coverage"}
	{call coverageStats()/}
{elseif meta.selected === "unused" /}
	{call unusedStats()/}
{elseif meta.selected === "size" /}
	{call unusedSize()/}
{/if}
{/macro}

{macro coverageStats()}
	{var stats = data.statistics[data.reportName][meta.selected].statements/}

	{foreach statPackage in stats}
		<div class="packageTitle" {if meta.package == statPackage_index}class="open"{/if} data-package="${statPackage_index}">
			${locale.STATS_PACKAGE_LENGTH} ${statPackage_index}
		</div>

		{if statPackage_index == meta.package}
			<div class="content" data-package="${statPackage_index}">
				<div id="chart_${statPackage_index}"></div>

				<table class="chart">
					<thead>
						<tr>
							<th>${locale.STATS_PACKAGE}</th>
							<th>${locale.STATS_COVERAGE}</th>
						</tr>
					</thead>
					<tbody>
						{foreach file in statPackage}
							<tr>
								<td>${file_index}</td>
								<td>${(100.0 * file).toFixed(2)}%</td>
							</tr>
						{/foreach}
					</tbody>
				</table>
			</div>
		{/if}
	{/foreach}
{/macro}

{macro unusedStats()}
	{var stats = data.statistics[data.reportName][meta.selected].byPackage/}
	{var totalUnused = data.statistics[data.reportName][meta.selected].total/}

	{foreach statPackage in stats}
		<div class="packageTitle" {if meta.package == statPackage_index}class="open"{/if} data-package="${statPackage_index}">
			${locale.STATS_PACKAGE_LENGTH} ${statPackage_index}
		</div>

		{if statPackage_index == meta.package}
			<div class="content" data-package="${statPackage_index}">
				<div id="chart_${statPackage_index}"></div>

				<table class="chart">
					<thead>
						<tr>
							<th>${locale.STATS_PACKAGE}</th>
							<th>${locale.STATS_UNUSED_STATEMENTS}</th>
							<th>${locale.STATS_UNUSED_PERCENTAGE}</th>
						</tr>
					</thead>
					<tbody>
						{foreach file in statPackage}
							<tr>
								<td>${file_index}</td>
								<td>${file}</td>
								<td>${(100.0 * file / totalUnused).toFixed(2)}%</td>
							</tr>
						{/foreach}
					</tbody>
				</table>
			</div>
		{/if}
	{/foreach}
{/macro}

{macro unusedSize()}
	{var stats = data.statistics[data.reportName][meta.selected]/}

	{foreach statPackage in stats}
		<div class="packageTitle" {if meta.package == statPackage_index}class="open"{/if} data-package="${statPackage_index}">
			${locale.STATS_PACKAGE_LENGTH} ${statPackage_index}
		</div>

		{if statPackage_index == meta.package}
			<div class="content" data-package="${statPackage_index}">
				<div id="chart_${statPackage_index}"></div>

				<table class="chart">
					<thead>
						<tr>
							<th>${locale.STATS_PACKAGE}</th>
							<th>${locale.STATS_SIZE_ORIGINAL}</th>
							<th>${locale.STATS_SIZE_COVERED}</th>
							<th>${locale.STATS_SIZE_GAIN}</th>
							<th>${locale.STATS_SIZE_GAIN_PERCENTAGE}</th>
						</tr>
					</thead>
					<tbody>
						{foreach file in statPackage}
							<tr>
								<td>${file_index}</td>
								<td>${formatSize(file.original)}</td>
								<td>${formatSize(file.covered)}</td>
								{var diff = file.original - file.covered /}
								<td>${formatSize(diff)}</td>
								<td>${(100.0 * (diff / file.original)).toFixed(2)}%</td>
							</tr>
						{/foreach}
					</tbody>
				</table>
			</div>
		{/if}
	{/foreach}
{/macro}

{/Template}