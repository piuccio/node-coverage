var fs = require("../lib/fileSystem");
var nodefs = require("fs");
var rmrf = require("rimraf");

function getAsserter() {
	var scope = {
		count : 0,
		files : {}
	};

	var callback = function (error, file, content) {
		if (!error) {
			scope.count += 1;
			scope.files[file] = content;
		}
	};

	scope.callback = callback;

	return scope;
};

exports.performSingleFile = function (test) {
	test.expect(4);

	var asserter = getAsserter();
	var fileName = __dirname + "/fs/txt/one";

	fs.perform(fileName, asserter.callback).then(function (error) {
		// Deferred resolved
		test.ifError(error);
		test.strictEqual(asserter.count, 1);
		test.strictEqual(asserter.files[fileName], "ONE");
		test.strictEqual(Object.keys(asserter.files).length, 1);

		test.done();
	}, function (error) {
		test.ok(false, error);
		test.done();
	});
};

exports.performMissingFile = function (test) {
	test.expect(1);

	var asserter = getAsserter();
	var fileName = __dirname + "/whatever_is_missing";

	fs.perform(fileName, asserter.callback).then(function (error) {
		test.ok(false, "Resolve method shouldn't be called");
		test.done();
	}, function (error) {
		test.ok(error, "Error was not passed");
		test.done();
	});
};

exports.performFolder = function (test) {
	test.expect(6);

	var asserter = getAsserter();
	var fileName = __dirname + "/fs/txt/";

	fs.perform(fileName + "*", asserter.callback).then(function (error) {
		test.ifError(error);
		test.strictEqual(asserter.count, 3);
		test.strictEqual(asserter.files[fileName + "one"], "ONE");
		test.strictEqual(asserter.files[fileName + "two"], "TWO");
		test.strictEqual(asserter.files[fileName + "oneMore"], "ONE");
		test.strictEqual(Object.keys(asserter.files).length, 3);
		
		test.done();
	}, function (error) {
		test.ok(false, error);
		test.done();
	});
};

exports.performEmptyFolder = function (test) {
	test.expect(1);

	var asserter = getAsserter();
	var fileName = __dirname + "/fs/txt/emptyFolder";

	fs.perform(fileName, asserter.callback).then(function (error) {
		test.ok(false, "Resolve method shouldn't be called");
		test.done();
	}, function (error) {
		test.ok(error, "Error was not passed");
		test.done();
	});
};

exports.performFolderRecursive = function (test) {
	test.expect(7);

	var asserter = getAsserter();
	var fileName = __dirname + "/fs/txt/";

	// The difference is that here there are two stars
	fs.perform(fileName + "**", asserter.callback).then(function (error) {
		test.ifError(error);
		test.strictEqual(asserter.count, 4);
		test.strictEqual(asserter.files[fileName + "one"], "ONE");
		test.strictEqual(asserter.files[fileName + "two"], "TWO");
		test.strictEqual(asserter.files[fileName + "oneMore"], "ONE");
		test.strictEqual(asserter.files[fileName + "subFolder/sub"], "SUB");
		test.strictEqual(Object.keys(asserter.files).length, 4);
		
		test.done();
	}, function (error) {
		test.ok(false, error);
		test.done();
	});
};

exports.performFolderRecursiveExclude = function (test) {
	test.expect(6);

	var asserter = getAsserter();
	var fileName = __dirname + "/fs/txt/";

	var performOptions = {
		exclude : ["/something_we_don/t_care", __dirname + "/fs/txt/subFolder"]
	};

	// This one should include also subFolder
	fs.perform(fileName + "**", asserter.callback, performOptions).then(function (error) {
		test.ifError(error);
		test.strictEqual(asserter.count, 3);
		test.strictEqual(asserter.files[fileName + "one"], "ONE");
		test.strictEqual(asserter.files[fileName + "two"], "TWO");
		test.strictEqual(asserter.files[fileName + "oneMore"], "ONE");
		test.strictEqual(Object.keys(asserter.files).length, 3);
		
		test.done();
	}, function (error) {
		test.ok(false, error);
		test.done();
	});
};

exports.performFolderRecursiveExcludeString = function (test) {
	test.expect(6);

	var asserter = getAsserter();
	var fileName = __dirname + "/fs/txt/";

	var performOptions = {
		exclude : __dirname + "/fs/txt/subFolder"
	};

	// This one should include also subFolder
	fs.perform(fileName + "**", asserter.callback, performOptions).then(function (error) {
		test.ifError(error);
		test.strictEqual(asserter.count, 3);
		test.strictEqual(asserter.files[fileName + "one"], "ONE");
		test.strictEqual(asserter.files[fileName + "two"], "TWO");
		test.strictEqual(asserter.files[fileName + "oneMore"], "ONE");
		test.strictEqual(Object.keys(asserter.files).length, 3);
		
		test.done();
	}, function (error) {
		test.ok(false, error);
		test.done();
	});
};

exports.performGenerateError = function (test) {
	test.expect(1);

	var fileName = __dirname + "/fs/txt/two";
	var callback = function () {
		throw new Error("Error in callback");
	};

	fs.perform(fileName, callback).then(function (error) {
		test.ok(false, "Resolve method shouldn't be called");
		test.done();
	}, function (error) {
		test.ok(error, "Error was not passed");
		test.done();
	});
};

exports.writeFileTo = {
	tearDown : function (callback) {
		rmrf(__dirname + "/tmp", callback);
	},

	exception : function (test) {
		test.expect(1);

		var destination = __dirname + "/tmp";
		nodefs.mkdirSync(destination);

		test.throws(function () {
			fs.writeFileTo("whatever", destination);
		});

		test.done();
	},
	
	singleFile : function (test) {
		test.expect(1);

		var destination = __dirname + "/tmp";

		var writer = fs.writeFileTo("/abc", destination);

		writer("/abc/a", "AA");

		var stored = nodefs.readFileSync(destination + "/a", "utf-8");

		test.strictEqual(stored, "AA");
		test.done();
	},
	
	folder : function (test) {
		test.expect(1);

		var destination = __dirname + "/tmp";

		var writer = fs.writeFileTo("/abc", destination);

		writer("/abc/a/b/c/d", "BB");

		var stored = nodefs.readFileSync(destination + "/a/b/c/d", "utf-8");

		test.strictEqual(stored, "BB");
		test.done();
	}
};