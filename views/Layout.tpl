{Template {
	$classpath : "views.Layout",
	$hasScript : true
}}
{macro main()}
{if !data.error}
	{section {
		id : "header",
		type : "h3",
		attributes : {
			classList : ["header"]
		},
		macro : "header"
	}/}

	{@aria:Template moduleCtrl.getModule() /}
{else /}
	#MODULE ERROR#
{/if}
{/macro}

{macro header()}
	node-coverage <em>${moduleCtrl.getLocation()}</em>
{/macro}
{/Template}