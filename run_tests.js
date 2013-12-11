var tests = process.argv.slice(2);
require("nodeunit").reporters.default.run(tests.length ? tests : ['test']);