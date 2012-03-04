var glob = {
	a : function () {
		if (true) {
			var b = 1;
		}
	},
	b : function () {
		var c = (function () {
			return false
		})();
	}
};

glob.a();