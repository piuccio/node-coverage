var one = "this statement is used";

var second = function () {
	var one = 1;

	var obj = {
		a : function () {
			var two = 2;
			callSomething(false);
			var three = 3;
		},
		b : 12
	}
};

function callSomething (yes) {
	if (yes) {
		var c = "c";
		var d = "d";
	} else if (!yes) {
		if (true && false) {
			var something = false;

			var inner = (function () {
				var inside = false;
				return function () {
					var inside = true;
				}
			})();
		}

		var somethingElse = true;
	}
}

callSomething(true);