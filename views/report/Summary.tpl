{Template {
	$classpath : "views.report.Summary",
	$hasScript : true,
	$res : {
		locale : "views.lib.Locale"
	},
	$macrolibs : {
		common : "views.lib.CommonLibs"
	}
}}

{var meta = {
	original : false
}/}

{macro main()}
	{call summary(locale.STATEMENT_COVERAGE, data.report.statements.percentage)/}
	{call summary(locale.CONDITION_COVERAGE, data.report.conditions.percentage)/}
	{call summary(locale.FUNCTION_COVERAGE, data.report.functions.percentage)/}
	{section {
		id : "legend",
		macro : {
			name : "legend",
			args : [data.action]
		},
		type : "div",
		attributes : {
			classList : ["legend"]
		},
		bindRefreshTo : [{
			inside : meta,
			to : "original"
		}]
	}/}
	<div class="clear">&nbsp;</div>


	{if data.action.name === "all"}
		{createView view on data.coverage[data.reportName].files /}
		${initView(view)|eat}

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
				{call fileRow(single_info.initIndex, single, files) /}
			{/foreach}
		</tbody>
	</table>
{/macro}

{macro sortableHeader(label, what, view)}
	{call common.sortableHeader(label, {
		fn : "sort",
		scope : this,
		args : {
			what : what,
			view : view
		}
	}, view, what) /}
{/macro}

{macro fileRow(file, report, view)}
	{var percentage = 0 /}
	<tr>
		<td>
			{var href = moduleCtrl.getFileUrl(file) /}
			<a href="${href}" data-href="${href}" {on click "getFile" /}>${file}</a>
		</td>

		{set percentage = report.statements.percentage /}
		<td class="${getClass(percentage)}">
			${formatNumber(percentage, 2)}
		</td>

		{set percentage = report.conditions.percentage /}
		<td class="${getClass(percentage)}">
			${formatNumber(percentage, 2)}
		</td>

		{set percentage = report.functions.percentage /}
		<td class="${getClass(percentage)}">
			${formatNumber(percentage, 2)}
		</td>
	</tr>
{/macro}

{macro legend(action)}
	{if action.name === "file" && !meta.original}
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
	{elseif action.name === "file" /}
		<dl>
			<dt>${locale.STATEMENT_PLURAL}</dt>
			<dd>${locale.STATEMENT_LEGEND}</dd>

			<dt>${locale.CONDITION_PLURAL}</dt>
			<dd>${locale.CONDITION_LEGEND}</dd>
		</dl>
	{/if}
{/macro}

{macro file()}
	{section {
		id : "reportFile",
		macro : "sourceCode",
		type : "table",
		attributes : {
			classList : ["small"]
		},
		bindRefreshTo : [{
			inside : meta,
			to : "original"
		}]
	}/}
{/macro}

{macro sourceCode()}
	{if meta.original}
		{call original()/}
	{else /}
		{call beauty()/}
	{/if}
{/macro}

{macro beauty()}
	<thead>
		<tr>
			<th>${locale.LINE}</th>
			<th>${locale.COUNT}</th>
			<th>${locale.TRUE}</th>
			<th>${locale.FALSE}</th>
			<th><a href="#" {on click {
				fn : function (evt) {
					evt.preventDefault(true);
					this.$json.setValue(this.meta, "original", !this.meta.original);
				},
				scope : this
			} /}>
				${locale.VIEW_ORIGINAL}
			</a></th>
		</tr>
	</thead>

	<tbody>
		{var newLine = true /}
		{foreach loc in data.report.code.beauty.src}
			{var missing = getMissingCondition(loc) /}

			<tr class="${missing["class"]}">
				<td>${loc_index}</td>
				<td>${getLineCount(loc)}</td>
				<td>${missing["true"]}</td>
				<td>${missing["false"]}</td>
				<td class="code"><xmp>${loc.s}</xmp></td>
			</tr>
		{/foreach}
	</tbody>
{/macro}

{macro original()}
	<thead>
		<tr>
			<th><a href="#" {on click {
				fn : function (evt) {
					evt.preventDefault(true);
					this.$json.setValue(this.meta, "original", !this.meta.original);
				},
				scope : this
			} /}>
				${locale.VIEW_BEAUTY}
			</a></th>
		</tr>
	</thead>

	<tbody>
		// In case an open span end on a new line
		{var fallThroughNewLine = false /}
		{foreach loc in data.report.code.original}
			<tr>
				<td class="code">
					{if fallThroughNewLine}
						<span class="${fallThroughNewLine}">
					{/if}

					{if loc.length > 0}
						{foreach node in loc}
							{if aria.utils.Type.isString(node)}
								<xmp>${node}</xmp>
							{else /}
								{if isNodeBegin(node)}
									{set fallThroughNewLine = getNodeClass(node) /}
									<span class="${fallThroughNewLine}">
									{if node.type === "sb"}
										<span class="lineCount">${getLineCount(node)}</span>
									{/if}
								{else /}
									{if node.type === "ce" && getPartialCondition(node)}
										<span class="partial">${getPartialCondition(node)}</span>
									{/if}

									{set fallThroughNewLine = false /}
									</span>
								{/if}
							{/if}
						{/foreach}
					{else /}
						&nbsp;
					{/if}
				</td>
			</tr>
		{/foreach}
	</tbody>
{/macro}


{/Template}