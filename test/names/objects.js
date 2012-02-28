function withName () {};

var someObject = {
	first : function () {},
	"second" : function () {},
	"th:ird" : function () {}
};

someObject.assigned = function () {};

// some statements to confuse
someObject.counter = 0;
someObject.counter += 1;

var a, b;
a = 0;
b = function () {};