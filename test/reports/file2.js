(function (context) {
	var myRunningFunction = function (shallIDoIt) {
		if (shallIDoIt) {
			return myRunningFunction(false);
		} else {
			myStupidFunction(true);
		}
	};

	var myStupidFunction = function () {
		if (true) {
			var doNothing = true;
		} else {
			var one = 1;
			var anotherOne = 1;
			var two = one + anotherOne;
		}

		return true;
	};

	if (context && context.isTrue) {
		myRunningFunction(myStupidFunction());
	}
})({
	isTrue : true,
	isFalse : (function () {return false;})()
});