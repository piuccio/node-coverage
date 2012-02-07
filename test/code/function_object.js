var fun1 = function () {
	return 1
}, fun2 = function () {
	return 2
};

var ofun = {
	one : function () {
		return 1
	},
	two : function () {
		return 2
	}
}

ofun.one(fun2()) == fun1(ofun.two())