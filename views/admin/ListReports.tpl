{Template {
	$classpath : "views.admin.ListReports",
	$hasScript : true,
	$res : {
		locale : "views.lib.Locale"
	},
	$macrolibs : {
		common : "views.lib.CommonLibs"
	},
	$dependencies : ["aria.utils.String"]
}}
{createView reports on data.reports /}
{macro main()}
<form class="content" action="merge" method="GET">
	<h4>${locale.REPORTS_FROM}<em>${data.conf.reportFolder}</em></h4>

	{section {
		id : "table",
		type : "table",
		macro : "table",
		attributes : {
			classList : ["reports"]
		}
	}/}
</form>
{/macro}

{macro table()}
	<thead>
		<tr>
			<th class="merge">
				<input type="submit" value="Merge">
			</th>
			{call common.sortableHeader(locale.REPORT, {
				fn : "sort",
				scope : this,
				args : {
					what : "id",
					view : reports
				}
			}, reports, "id") /}
			{call common.sortableHeader(locale.DATE, {
				fn : "sort",
				scope : this,
				args : {
					what : "time",
					view : reports
				}
			}, reports, "time") /}
			<th>VARIABLE</th>
		</tr>
	</thead>
	<tbody>
		{foreach report inView reports}
			{call reportLine(report) /}
		{/foreach}
	</tbody>
{/macro}

{macro reportLine(report)}
	<tr>
		<td>
			<input type="checkbox" name="report" value="${report.id}">
		</td>
		<td>
			<a href="/report/${report.id}" data-href="/report/${report.id}" {on click "getReport" /}>${report.name}</a>
		</td>
		<td>
			<em>${report.date}</em>
		</td>
		<td>
			<a href="VARIABLE">VARIABLE</a>
		</td>
	</tr>
{/macro}
{/Template}