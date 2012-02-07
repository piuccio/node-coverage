var saySomething = function (arg) {
	return arg;
}, a;

if (true && true) {
	a = 0;
}

if (true && false) {
	a = 1;
}

if (false || true) {
	a = 2;
}

if (saySomething(false) || true) {
	a = 3;
}

if (saySomething(true) && saySomething(false)) {
	a = 4;
}

if (true && false && true && false) {
	a = 5;
}