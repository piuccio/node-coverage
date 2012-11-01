// Pseudo random number generator !

/**
 * Returns an integer number between 0 and 2^48 - 1
 * Uniform distribution
 *
 * @param {Boolean} zeroOne If true returns an integer between 0 and 1, uniform distribution
 *
 * @return {Number}
 */
Math.pseudoRandom = (function () {
	/**
	 * Modulus. Period length
	 * @type Number
	 */
	var m = Math.pow(2, 48);

	/**
	 * Multiplier, must be greater than 0 and smaller than the modulus
	 * @type Number
	 */
	var a = 25214903917;

	/**
	 * Increment
	 * @type Number
	 */
	var c = 11;

	/**
	 * Last random number generated (works as a seed)
	 * @type Number
	 */
	var last = null;

	return function (zeroOne) {
		if (last === null) {
			last = Math.pseudoRandom.seed;
		}

		var next = (a * last + c) % m;

        last = next;

        if (zeroOne) {
        	return next / m;
        } else {
        	return next;
        }
    };
})();

/**
 * Seed
 * @type Number
 */
Math.pseudoRandom.seed = 12483;

var random = Math.pseudoRandom();