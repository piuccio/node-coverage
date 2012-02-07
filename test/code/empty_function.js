var empty = function () {};

var full = function (a, b) {
	a.call();
}

var useMePlease = function () {
	return (function b () {
		return true;
	})();
}

full(useMePlease);