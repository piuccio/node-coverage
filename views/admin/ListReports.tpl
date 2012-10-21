{Template {
	$classpath : "views.admin.ListReports",
	$hasScript : true
}}
{createView reports on data.reports /}
{macro main()}
<form class="content" action="merge" method="GET">
	<h4>Reports from <em>VARIABLE</em></h4>

	<table class="reports">
		<thead>
			<tr>
				<th class="merge">
					<input type="submit" value="Merge">
				</th>
				<th>Report</th>
				<th>Date</th>
				<th>Function stack</th>
			</tr>
		</thead>
		<tbody>
			{foreach report inView reports}
				{call reportLine(report) /}
			{/foreach}
		</tbody>
	</table>
</form>
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
			<a href="VARIABLE">view</a>
		</td>
	</tr>
{/macro}
{/Template}