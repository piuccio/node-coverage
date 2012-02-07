var sayTrue = function () {return true}, a = 1;

// true conditions
if (true) {
	a = 1
}

if (sayTrue()) {
	a = 1
}

if ((function () {return true})()) {
	a = 1
}

if ((function (arg) {return arg})(true)) {
	a = 1
}

if (a) {
	a = 1
}

if (1) {
	a = 1
}

if (!0) {
	a = 1
}

if ({}) {
	a = 1
}

if ([]) {
	a = 1
}