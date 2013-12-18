var done = true;
/**
 * Logger constructor
 */
var Logger = function () {
	var scope = [];
	return {
		log : function (text) {
			scope.push(text);
		},
		all : <span class='functions not-covered'>function () {
			<span class='statements not-covered'>return scope.join("\n");</span>
		}</span>
	};
};
// logger instance
var log = new Logger();
if (<span class='conditions not-covered missing-false'>done</span> && <span class='conditions not-covered missing-false'>!false</span>) {
	log.log("condition true");
} else {
	<span class='statements not-covered'>log.log("condition false");</span>
}