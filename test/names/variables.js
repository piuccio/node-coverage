(function () {
	// this function is really anonymous
});

function glob () {
	// this function has a name
};

var name = function () {
	// could use "name" for this function
};

var first = function () {}, second = function () {};

var override = function thisHasAName () {};

// some variable to mess up things
var a = 1, b;

var nested = function () {
	var inner = function () {
		function inner () {
			// enough
		};
	};
};