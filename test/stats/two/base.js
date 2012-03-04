function nothing () {
	var a = 1;
	a = 2;
	a = 3;
}

var doNothing = {
	a : 1,
	b : 1,
	c : function () {
		var d = 1;
		d = 2;
	}
};