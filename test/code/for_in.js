var obj = {
	num : 1,
	fn : function () {
		var num = 1;
	},
	arr : []
};
for (key in obj) if (obj[key].call) obj[key].call(this)