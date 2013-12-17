/**
 * Administration server.
 * Allows to browse the list of reports and provides methods to deal with them
 */
var express = require("express");
var path = require("path");
var storage = require("../storage");
var fileLib = require("../file");
var report = require("../report");

/**
 * Base path where every view file is stored
 */
var viewsPath = path.normalize(__dirname + "/../../views");
/**
 * Server configuration
 * Created when the server starts, and lives here to be shared across middlewares
 */
var conf = null;
/**
 * Whether we want to have more verbose logging
 */
var verbose = false;

/**** MIDDLEWARES ****/

/**
 * Landing page
 */
function home (req, res) {
	res.sendfile(viewsPath + "/index.html");
}

/**
 * Generate a static middleware from a given folder.
 * Everything starting with 'name' is served as static in 'base'
 */
function staticFor (name, base) {
	return function (req, res, next) {
		if (req.path.indexOf(name) !== 0) {
			next();
		} else {
			var fileName = req.path.substring(name.length);
			res.sendfile(path.join(base, fileName));
		}
	};
}

/**
 * JSON API
 *
 * Url format is :
 * /json/[action]/[id]/sort/[what]/[how]
 *
 * [action] : Either
 *     'all' to get the whole list of reports
 *     'report' to get the details of a single report
 * [id] : Report name
 * [what] : Key on which reports are sorted
 * [how] : 'asc' or 'desc' order
 */
function json (req, res, next) {
	var request = req.path.substring("/json/".length).split("/");

	var action = request[0];
	var id = request[1];
	if (request[2] === "sort") {
		var what = request[3];
		var how = request[4];
	}

	if (action === "all") {
		storage(conf.options).keys(conf.reportFolder, function (error, list) {
			if (error) {
				res.send(500, "Error while reading reports list\n" + err);
			} else {
				res.json({
					reports : list.map(function (location) {
						var id = path.basename(location);
						var name = fileLib.extractName(id);
						var time = fileLib.extractTime(id);

						return {
							id : id,
							name : name,
							time : time,
							date : (new Date(time)).toString()
						};
					}),
					conf : conf
				});
			}
		});
	} else if (action === "report") {
		var fullReportName = path.join(conf.reportFolder, id);

		storage(conf.options).read(fullReportName, function (error, content) {
			if (error) {
				next(error);
			} else {
				try {
					var json = JSON.parse(content);

					json.sort = sort(json.files, what, how);

					res.json(json);
				} catch (ex) {
					res.send(500, "Invalid report file\n" + ex.message);
				}
			}
		});
	} else if (action === "stat") {
		var fullReportName = path.join(conf.reportFolder, id);

		storage(conf.options).read(fullReportName, function (error, content) {
			if (error) {
				next(error);
			} else {
				try {
					var json = JSON.parse(content);
					report.stats(json, function (stats) {
						res.json(stats);
					});
				} catch (ex) {
					res.send(500, "Invalid report file\n" + ex.message);
				}
			}
		});
	} else {
		next();
	}
}

function merge (req, res, next) {
	var callback = function (error, response) {
		if (error) {
			res.send(500, error);
		} else {
			res.send(200, response);
		}
	};

	if (req.method !== "POST") {
		callback("Invalid method. Expecting POST requests");
	} else if (!req.body.map) {
		callback("Invalid message. The list of reports to be merged should be an array.");
	} else {
		var fullReports = req.body.map(function (shortName) {
			return path.join(conf.reportFolder, shortName);
		});
		storage(conf.options).read(fullReports, function (error, reports) {
			if (error) {
				callback(error.message);
			} else {
				var toBeMerged = [];
				for (var single in reports) {
					toBeMerged.push(JSON.parse(reports[single]));
				}

				var reportName = fileLib.createReportName(req.body);
				var fullName = path.join(conf.reportFolder, reportName);
				var mergedReport = report.mergeReports(toBeMerged);
				mergedReport.name = reportName;
				var json = JSON.stringify(mergedReport);

				console.log("Saving merged report", fullName);
				storage(conf.options).save(fullName, json, function (error) {
					callback(error, reportName);
				});
			}
		});
	}
}


/**
 * Routing table.
 * It redirects every call to the correct middleware
 */
var routingTable = {
	"/" : home,
	"/views" : staticFor("/views", viewsPath),
	"/json" : json,
	"/report" : home,  // Controller will connect to the proper JSON API
	"/merge" : merge,
	"/stats" : home
};

/**
 * Start a server instance
 *
 * @param {String} docRoot Document root, base folder for all statics
 * @param {Number} port Server port
 * @param {String} adminRoot Folder where all reports are to be saved
 * @param {Number} adminPort Administration server's port (not used)
 * @param {Object} coverageOptions [Optional] Additional option
 */
exports.start = function (docRoot, port, adminRoot, adminPort, coverageOptions) {
	conf = {
		reportFolder : adminRoot,
		documentRoot : docRoot,
		options : coverageOptions
	};

	var app = express();

	app.use(express.bodyParser());

	app.use(function (req, res, next) {
		var action = req.path.substring(1).split("/");
		var route = "/" + action[0];

		var middleware = routingTable[route];
		if (!middleware) {
			console.log("No middleware for", req.path);
			next();
		} else {
			if (verbose) {
				console.log("[REQ]", req.path);
			}
			middleware.call(this, req, res, next);
		}
	});

	return app.listen(adminPort);
};

/**
 * Sort a list of files according to a given key and direction.
 * Returns a sorted list of ids and a description on how files were sorted
 *
 * Throws an exception if sort key or direction is not valid
 *
 * @param {Object} files List of file, the keys is the file id
 * @param {String} what Sort key
 * @param {String} how Direction, either 'ASC' or 'DESC'
 *
 * @return {Object}
 */
function sort (files, what, how) {
	if (!what) {
		what = "id";
	} else {
		what = what.toLowerCase();
	}
	if (["id", "statements", "conditions", "functions"].indexOf(what) === -1) {
		throw new TypeError("Invalid sort key");
	}

	if (!how) {
		how = "ASC";
	} else {
		how = how.toUpperCase();
	}
	if (["ASC", "DESC"].indexOf(how) === -1) {
		throw new TypeError("Invalid sort direction");
	}

	var sorted = Object.keys(files).sort(getSortMethod(files, what, how));

	return {
		by: what,
		direction: how,
		files: sorted
	};
}

function getSortMethod (files, what, how) {
	if (what === "id") {
		return function (first, second) {
			// In id sort we can just sort by keys
			var compare = first.localeCompare(second);
			return how === "ASC" ? compare : -compare;
		};
	} else {
		return function (first, second) {
			var firstValue = files[first][what].percentage;
			var secondValue = files[second][what].percentage;

			var compare = firstValue - secondValue;
			return how === "ASC" ? -compare : compare;
		};
	}
}

// TODO function coverage?
// TODO stats sends back to the home, render stats client side
