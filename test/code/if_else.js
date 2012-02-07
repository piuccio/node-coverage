function not(a, b) {
	if (a && b) {
		return true;
	} else if (a || b) {
		return true;
	} else {
		return false;
	}
}

if (not(true, true)) {
	not(true, false);
} else if (not(false, false)) {
	not(false, true);
}