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
{var meta = {
	selection : []
}/}

{macro main()}
{section {
	id : "main",
	macro : "form",
	bindRefreshTo : [{
		inside : data,
		to : "error"
	}]
}/}
{/macro}

{macro form()}
{if data.error}
<pre class="cow">
${getErrorMessage(data.error)}
{CDATA}
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
{/CDATA}
</pre>
<a href="/" {on click {
	fn : function (evt) {
		evt.preventDefault(true);
		this.$json.setValue(this.data, "error", false);
	},
	scope : this
}/}>back</a>
{else /}
	<form class="content" action="merge" method="POST">
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
{/if}
{/macro}

{macro table()}
	<thead>
		<tr>
			{call actionButton()/}
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
			<input type="checkbox" name="report" {on click {
				fn : "selectReport",
				scope : this,
				args : report
			}/}>
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

{macro actionButton()}
	{section {
		id : "button",
		macro : "button",
		type : "th",
		attributes : {
			classList : ["merge"]
		},
		bindRefreshTo : [{
			inside : meta,
			to : "selection"
		}]
	}/}
{/macro}

{macro button()}
	{if meta.selection.length === 1}
		// TODO admin action : rename, delete
	{elseif meta.selection.length > 1 /}
		<button {on click {
			fn : "merge",
			scope : this,
			args : meta.selection
		}/}>Merge</button>
	{/if}
{/macro}
{/Template}