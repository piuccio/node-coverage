var outside = true ? function () {return true} : function () {return false};

var inside = false ? function one () {return true} : function () {return false};

var obj = {};
obj.property = true ? function () {return true} : function () {return false};

obj.another = false ? function () {return true} : function two () {return false};