/**
 * I don't want to test exactly the lines/conditions/functions ids.
 * So the key is just the line number
 * The expected objects looks like this
 *
 * statements : {
 *    number : how many statements,
 *    total : how many times they are called (total)
 * },
 * conditions : {
 *    true
 *       number : how many conditions are evaluated true
 *       total : how many times all statement are evaluated true
 *    false
 *       number : how many conditions are evaluated false
 *       total : how many times all statement are evaluated false
 *    all : how many conditions
 * },
 * functions : {
 * 
 * }
 */
exports.results = {
	"base.js" : {
		statements : {
			number : 3,
			total : 3
		},
		conditions : {
			"true" : {
				number : 0,
				total : 0
			},
			"false" : {
				number : 0,
				total : 0
			},
			"all" : 0
		},
		functions : []
	},
	"longlines.js" : {
		statements : {
			number : 1,
			total : 1
		},
		conditions : {
			"true" : {
				number : 0,
				total : 0
			},
			"false" : {
				number : 0,
				total : 0
			},
			"all" : 0
		},
		functions : []
	},
	"function.js" : {
		statements : {
			number : 4,
			total : 4
		},
		conditions : {
			"true" : {
				number : 0,
				total : 0
			},
			"false" : {
				number : 0,
				total : 0
			},
			"all" : 0
		},
		functions : []
	},
	"if_no_block.js" : {
		statements : {
			number : 9,
			total : 6
		},
		conditions : {
			"true" : {
				number : 1,
				total : 1
			},
			"false" : {
				number : 1,
				total : 1
			},
			"all" : 2
		},
		functions : []
	},
	"no_block.js" : {
		statements : {
			number : 8,
			total : 5
		},
		conditions : {
			"true" : {
				number : 0,
				total : 0
			},
			"false" : {
				number : 0,
				total : 0
			},
			"all" : 0
		},
		functions : []
	},
	"label_continue.js" : {
		statements : {
			number : 2,
			total : 2
		},
		conditions : {
			"true" : {
				number : 0,
				total : 0
			},
			"false" : {
				number : 0,
				total : 0
			},
			"all" : 0
		},
		functions : []
	},
	"cond_simple_if.js" : {
		statements : {
			number : 22,
			total : 22
		},
		conditions : {
			"true" : {
				number : 9,
				total : 9
			},
			"false" : {
				number : 0,
				total : 0
			},
			"all" : 9
		},
		functions : []
	},
	"cond_simple_if_false.js" : {
		statements : {
			number : 24,
			total : 15
		},
		conditions : {
			"true" : {
				number : 1,
				total : 1
			},
			"false" : {
				number : 9,
				total : 9
			},
			"all" : 10
		},
		functions : []
	},
	"function_object.js" : {
		statements : {
			number : 7,
			total : 7
		},
		conditions : {
			"true" : {
				number : 0,
				total : 0
			},
			"false" : {
				number : 0,
				total : 0
			},
			"all" : 0
		},
		functions : []
	},
	"cond_decision_if.js" : {
		statements : {
			number : 17,
			total : 17
		},
		conditions : {
			"true" : {
				number : 5,
				total : 5
			},
			"false" : {
				number : 2,
				total : 2
			},
			"all" : 7
		},
		functions : []
	},
	"cond_multiple_if.js" : {
		statements : {
			number : 14,
			total : 13
		},
		conditions : {
			"true" : {
				number : 7,
				total : 7
			},
			"false" : {
				number : 5,
				total : 5
			},
			"all" : 14
		},
		functions : []
	},
	"cond_group_if.js" : {
		statements : {
			number : 4,
			total : 2
		},
		conditions : {
			"true" : {
				number : 3,
				total : 3
			},
			"false" : {
				number : 2,
				total : 2
			},
			"all" : 7
		},
		functions : []
	},
	"if_else.js" : {
		statements : {
			number : 10,
			total : 8
		},
		conditions : {
			"true" : {
				number : 4,
				total : 5
			},
			"false" : {
				number : 1,
				total : 1
			},
			"all" : 6
		},
		functions : []
	},
	"empty_function.js" : {
		statements : {
			number : 7,
			total : 7
		},
		conditions : {
			"true" : {
				number : 0,
				total : 0
			},
			"false" : {
				number : 0,
				total : 0
			},
			"all" : 0
		},
		functions : []
	}
};