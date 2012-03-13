var bool = true ? true : false;

var fn = false ? function () {return true} : function () {return false}

var cond = {
	num : fn() ? 1 : 0
};

var multiple = false || fn() || cond.num > 0 ? 1 : 2;

var obj = {
	one : true ? function () {return true} : function () {return false}
};
obj.two = false ? function () {return true} : function () {return false};