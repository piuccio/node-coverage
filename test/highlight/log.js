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
		all : function () {
			return scope.join("\n");
		}
	};
};
// logger instance
var log = new Logger();
if (done && !false) {
	log.log("condition true");
} else {
	log.log("condition false");
}