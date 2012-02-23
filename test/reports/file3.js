var someFalsyValue = false;

function justAFunction () {};

if (someFalsyValue || window.thisIsAGlobalVariable) {
	var whatsThis = (function () {
		return function (anotherFunction) {
			anotherFunction.call();
		}
	})();

	whatsThis(justAFunction);
} else {
	for (var i = 0; i < 10; i += 1) {
		someFalsyValue = true;
	}
}