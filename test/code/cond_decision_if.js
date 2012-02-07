var saySomething = function (arg) {
	return arg;
}, a;

if (0 + 1) {
	a = 0;
}

if (saySomething(5) - 1) {
	a = 1;
}

if (a = 3) {
	a = 2;
}

if (a = 3, true) {
	a = 3;
}

if (true, false) {
	a = 4;
}

if (0 > saySomething(-3)) {
	a = 5;
}

var isFalse = !(!!saySomething(true));
if (isFalse) {
	a = 6;
}