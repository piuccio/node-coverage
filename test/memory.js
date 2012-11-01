// Unit tests for storage classes

var storage = require("../lib/storage");
var rmrf = require("rimraf");

exports.interface = {
	invalidModules : function (test) {
		test.expect(7);

		test.throws(function () {
			storage();
		}, TypeError, "missing options");

		test.throws(function () {
			storage({
				verbose : true
			});
		}, TypeError, "missing module");

		test.throws(function () {
			storage({
				storage : "this_doesn_t_exist"
			});
		}, TypeError, "invalid module name");

		test.throws(function () {
			storage({
				storage : {
					list : 1
				}
			});
		}, TypeError, "invalid module, missing both");

		test.throws(function () {
			storage({
				storage : {
					read : function () {}
				}
			});
		}, TypeError, "invalid module, missing save");

		test.throws(function () {
			storage({
				storage : {
					save : function () {}
				}
			});
		}, TypeError, "invalid module, missing read");

		test.throws(function () {
			storage({
				storage : {
					read : {},
					save : []
				}
			});
		}, TypeError, "invalid module, not a function");

		test.done();
	},

	validModule : function (test) {
		test.expect(3 * 3);

		var module = storage({
			storage : "memory"
		});
		test.ok(!!module, "Couldn't find module memory");
		test.equal(typeof module.read, "function", "memory - read is not a function");
		test.equal(typeof module.save, "function", "memory - save is not a function");

		module = storage({
			storage : "disk"
		});
		test.ok(!!module, "Couldn't find module disk");
		test.equal(typeof module.read, "function", "disk - read is not a function");
		test.equal(typeof module.save, "function", "disk - save is not a function");

		module = storage({
			storage : {
				read : function () {},
				save : function () {},
				whoCares : 12
			},
			whoCares : "not me"
		});
		test.ok(!!module, "Couldn't find defined module");
		test.equal(typeof module.read, "function", "module - read is not a function");
		test.equal(typeof module.save, "function", "module - save is not a function");

		test.done();
	}
};

exports.memory = {
	readEmpty : function (test) {
		var module = storage({
			storage : "memory"
		});

		readEmpty(test, module);
	},

	normalRead : function (test) {
		var module = storage({
			storage : "memory"
		});

		normalRead(test, module);
	},

	override : function (test) {
		var module = storage({
			storage : "memory"
		});

		override(test, module);
	}
};

exports.disk = {
	tearDown : function (callback) {
		rmrf(__dirname + "/tmp", callback);
	},

	readEmpty : function (test) {
		var module = storage({
			storage : "disk"
		});

		readEmpty(test, module);
	},

	normalRead : function (test) {
		var module = storage({
			storage : "disk"
		});

		normalRead(test, module);
	},

	override : function (test) {
		var module = storage({
			storage : "disk"
		});

		override(test, module);
	},

	folder : function (test) {
		var module = storage({
			storage : "disk"
		});

		test.expect(3);

		var a = __dirname + "/tmp/a";
		module.save(a, "folder", function (err) {
			module.save(__dirname + "/tmp", "other", function (err) {
				test.ok(!!err, "There should be an error writing to a folder");

				module.read(a, function (error, text) {
					test.ok(!error, "There shouldn't be errors reading a");
					test.equal(text, "folder");

					test.done();
				});
			});
		});
	}
};


readEmpty = function (test, module) {
	test.expect(1);

	module.read("anything", function (err, content) {
		test.ok(!!err, "There should an error reading anything");
		test.done();
	});
};

normalRead = function (test, module) {
	test.expect(5);

	// Some object names
	var a = __dirname + "/tmp/a";
	var b = __dirname + "/tmp/b";
	var c = __dirname + "/tmp/c";

	module.save(a, "text", function (err) {
		test.ok(!err, "There shouldn't be errors saving a");

		module.read(a, function (error, content) {
			test.ok(!error, "There shouldn't be errors reading a");
			test.equal(content, "text");

			module.save(b, "other", function () {
				module.save(c, "another", function () {

					module.read(b, function (lastError, text) {
						test.ok(!lastError, "There shouldn't be errors reading b");
						test.equal(text, "other");

						test.done();
					});
				});
			});
		});
	});
};

override = function (test, module) {
	test.expect(3);

	var a = __dirname + "/tmp/a";

	module.save(a, "text", function (err) {
		module.save(a, "another", function (err) {
			test.ok(!err, "There shouldn't be errors saving a again");

			module.read(a, function (error, text) {
				test.ok(!error, "There shouldn't be errors reading a");
				test.equal(text, "another");

				test.done();
			});
		});
	});
};