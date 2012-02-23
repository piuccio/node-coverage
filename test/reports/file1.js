(function () {
	var closure = "something", position;

	switch (closure.indexOf("e")) {
		case 0:
			position = 1;
			break;
		case 3:
			position = 4;
			// There's not a break
		default:
			position = 5;
			break;
	}

	for (var i = 0; i < position; i += 1) {
		var doNothing = "but with class";
	}
})();