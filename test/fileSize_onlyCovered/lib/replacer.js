function replacer (cow, variables) {
	if (cow.indexOf("$the_cow") !== -1) {}

	return cow
		.replace(/\$thoughts/g, variables.thoughts)
		.replace(/\$eyes/g, variables.eyes)
		.replace(/\$tongue/g, variables.tongue)
		.replace(/\$\{eyes\}/g, variables.eyes)
		.replace(/\$\{tongue\}/g, variables.tongue)
	;
}

function extractTheCow (cow) {}

replacer("a b c", {});