{Template {
	$classpath : "views.report.Summary",
	$hasScript : true,
	$res : {
		locale : "views.lib.Locale"
	}
}}

{macro main()}
	{call summary(locale.STATEMENT_COVERAGE, data.report.statements.percentage)/}
	{call summary(locale.CONDITION_COVERAGE, data.report.conditions.percentage)/}
	{call summary(locale.FUNCTION_COVERAGE, data.report.functions.percentage)/}
	{call legend(data.action.name)/}
	<div class="clear">&nbsp;</div>


	{if data.action.name === "all"}
		{createView view on data.coverage[data.reportName].files /}
		${initView(view)|empty:""}

		{section {
			id : "content",
			macro : {
				name : "content",
				args : [view]
			},
			type : "div",
			attributes : {
				classList : ["content"]
			}
		}/}
	{elseif data.action.name === "file" /}
		{section {
			id : "file",
			macro : {
				name : "file"
			},
			type : "div",
			attributes : {
				classList : ["content"]
			}
		}/}
	{else/}
		What?
	{/if}
	
{/macro}

{macro summary(label, percentage)}
	<div class="summary">
		<h2>
			${label}
			<h1>${formatNumber(percentage, 2)}</h1>
		</h2>
	</div>
{/macro}

{macro content(files)}
	<table>
		<thead>
			// Links on top right
			<tr class="partial">
				<th></th>
				<th colspan="3" class="flap">
					<a href="VARIABLE">${locale.STAT_GRAPH}</a>
				</th>
			</tr>

			// Sortable header
			<tr>
				{call sortableHeader(locale.FILE, "file", files)/}
				{call sortableHeader(locale.STATEMENT, "statements", files)/}
				{call sortableHeader(locale.CONDITION, "conditions", files)/}
				{call sortableHeader(locale.FUNCTION, "functions", files)/}
			</tr>
		</thead>

		<tbody>
			{foreach single inView files}
				{call fileRow(single, files) /}
			{/foreach}
		</tbody>
	</table>
{/macro}

{macro sortableHeader(label, what, view)}
	<th>
		<a href="#" {on click {
				fn : "sort",
				scope : this,
				args : {
					what : what,
					view : view
				}
			} /}>${label}</a>
			{if view.sortName === what}
				{var iconName = view.sortOrder === view.SORT_ASCENDING ? "down" : "up" /}
				<img src="/views/statics/imgs/${iconName}_arrow.png" alt="">
			{/if}
	</th>
{/macro}

{macro fileRow(single, view)}
	{var percentage = 0 /}
	<tr>
		<td>
			{var href = moduleCtrl.getFileUrl(single.file) /}
			<a href="${href}" data-href="${href}" {on click "getFile" /}>${single.file}</a>
		</td>

		{set percentage = single.report.statements.percentage /}
		<td class="${getClass(percentage)}">
			${formatNumber(percentage, 2)}
		</td>

		{set percentage = single.report.conditions.percentage /}
		<td class="${getClass(percentage)}">
			${formatNumber(percentage, 2)}
		</td>

		{set percentage = single.report.functions.percentage /}
		<td class="${getClass(percentage)}">
			${formatNumber(percentage, 2)}
		</td>
	</tr>
{/macro}

{macro legend(action)}
	{if action === "file"}
		<div class="legend">
			<dl>
				<dt>${locale.LINE}</dt>
				<dd>${locale.LINE_NUMBER}</dd>

				<dt>${locale.COUNT}</dt>
				<dd>${locale.COUNT_DEFINITION}</dd>

				<dt>${locale.TRUE}</dt>
				<dd>${locale.TRUE_DEFINITION}</dd>

				<dt>${locale.FALSE}</dt>
				<dd>${locale.FALSE_DEFINITION}</dd>
			</dl>
		</div>
	{/if}
{/macro}

{macro file()}
	<table class="small">
		<thead>
			<tr>
				<th>${locale.LINE}</th>
				<th>${locale.COUNT}</th>
				<th>${locale.TRUE}</th>
				<th>${locale.FALSE}</th>
			</tr>
		</thead>

		<tbody>
			{foreach loc in data.report.code.src}
				{var missing = getMissingCondition(loc) /}

				<tr class="${missing["class"]}">
					<td>${loc_index}</td>
					<td>${getLineCount(loc)}</td>
					<td>${missing["true"]}</td>
					<td>${missing["false"]}</td>
					<td class="code">${loc.s}</td>
				</tr>
			{/foreach}
		</tbody>
	</table>
{/macro}


{/Template}