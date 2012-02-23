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
 *    number : how many functions are defined,
 *    total : how many times they are called
 * }
 */
exports.results = {
	code : {
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
			functions : {
				number : 0,
				total : 0
			}
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
			functions : {
				number : 0,
				total : 0
			}
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
			functions : {
				number : 1,
				total : 1
			}
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
			functions : {
				number : 2,
				total : 1
			}
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
			functions : {
				number : 0,
				total : 0
			}
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
			functions : {
				number : 0,
				total : 0
			}
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
			functions : {
				number : 3,
				total : 3
			}
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
			functions : {
				number : 3,
				total : 3
			}
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
			functions : {
				number : 4,
				total : 4
			}
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
			functions : {
				number : 1,
				total : 3
			}
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
			functions : {
				number : 1,
				total : 3
			}
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
			functions : {
				number : 0,
				total : 0
			}
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
			functions : {
				number : 1,
				total : 2
			}
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
			functions : {
				number : 4,
				total : 3
			}
		},
		"for_in.js" : {
			statements : {
				number : 5,
				total : 7
			},
			conditions : {
				"true" : {
					number : 1,
					total : 1
				},
				"false" : {
					number : 1,
					total : 2
				},
				"all" : 1
			},
			functions : {
				number : 1,
				total : 1
			}
		},
		"minified.js" : {
			statements : {
				number : 15,
				total : 12
			},
			conditions : {
				"true" : {
					number : 1,
					total : 1
				},
				"false" : {
					number : 2,
					total : 2
				},
				"all" : 3
			},
			functions : {
				number : 3,
				total : 2
			}
		}
	},


	merge : {
		"file1.js" : {
			statements : {
				number : 10,
				total : 12
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
			functions : {
				number : 1,
				total : 1
			}
		},
		"file2.js" : {
			statements : {
				number : 15,
				total : 16
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
				"all" : 4
			},
			functions : {
				number : 4,
				total : 6
			}
		},
		"file3.js" : {
			statements : {
				number : 9,
				total : 14
			},
			conditions : {
				"true" : {
					number : 0,
					total : 0
				},
				"false" : {
					number : 2,
					total : 2
				},
				"all" : 2
			},
			functions : {
				number : 3,
				total : 0
			}
		}
	},


	mergeSelf : {
		"file1.js" : {
			statements : {
				number : 10,
				total : 24
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
			functions : {
				number : 1,
				total : 2
			}
		},
		"file2.js" : {
			statements : {
				number : 15,
				total : 32
			},
			conditions : {
				"true" : {
					number : 4,
					total : 10
				},
				"false" : {
					number : 1,
					total : 2
				},
				"all" : 4
			},
			functions : {
				number : 4,
				total : 12
			}
		},
		"file3.js" : {
			statements : {
				number : 9,
				total : 28
			},
			conditions : {
				"true" : {
					number : 0,
					total : 0
				},
				"false" : {
					number : 2,
					total : 4
				},
				"all" : 2
			},
			functions : {
				number : 3,
				total : 0
			}
		}
	},

	mergeSpecial : {
		coverage : {
			total : 9,
			visited : 9,
			statementsPercentage : 100,
			conditions : 2,
			conditionsTrue : 1,
			conditionsFalse : 2,
			conditionsPercentage : 75,
			functions : 3,
			functionsCalled : 3,
			functionsPercentage : 100
		},
		details : {
			statements : {
				number : 9,
				total : 21
			},
			conditions : {
				"true" : {
					number : 1,
					total : 1
				},
				"false" : {
					number : 2,
					total : 3
				},
				"all" : 2
			},
			functions : {
				number : 3,
				total : 3
			}
		}
	}
};