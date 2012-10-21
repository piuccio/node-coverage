{Template {
	$classpath : "views.Layout",
	$hasScript : true
}}
{macro main()}
{section {
	id : "header",
	type : "h3",
	attributes : {
		classList : ["header"]
	},
	macro : "header"
}/}

{@aria:Template moduleCtrl.getModule() /}
{/macro}

{macro header()}
	node-coverage <em>${moduleCtrl.getLocation()}</em>
{/macro}
{/Template}