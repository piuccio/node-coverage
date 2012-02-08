# node-coverage
_node-coverage_ is a tool that measures code coverage of JavaScript application.

Code coverage is a measure typically used in software testing to describe the degree to which the source code has been tested. This is an indirect measure of quality of your tests.

node-coverage can be used not only to extract measures on how well the application is covered by a test suite, but also to understand how much code is actually needed to load your application.

## Coverage criteria
There are a large variety of coverage criteria. node-coverage measures

* __statement coverage__. Whether or not each statement has been executed.
* __condition coverage__. Whether or not each boolean sub-expression evaluated both to `true` and `false`.
* __decision coverage__. For Javascript this implies from condition coverage.
* __function coverage__. Whether or not each functions has been called. Full statement coverage doesn't imply full function coverage when empty functions are used. An empty function has full statement coverage even when it's not called.

Why statement coverage is not enough?
Consider the following code:

    var dangerous = createAnObject();
    if (dangerous != null) {
       dangerous.doSomething();
    }
    dangerous.doSomethingElse();

A test suite where `dangerous` is always different from `null` runs fine and achieve 100% statement coverage, however the program fails when `dangerous` is `null`.

Such test suite has only 50% of condition coverage because the condition `dangerous != null` is never evaluated `false`.

Note that for languages where boolean operators are not short-circuited, condition coverage does not necessarly imply decision coverage. This is __not__ the case in JavaScript.

    if (a && b) {
       //...
    }
When `a` is `false`, `b` is not evaluated at all.
    a = true, b = true
    a = false, b = true
has 100% decision coverage because the `if` evaluates both to `true` and `false` but only 75% condition coverage because `b` never evaluates `false`.

Adding a test where
    a = false, b = false
won't increase condition coverage because the second condition (wheter `b` is `true` or not) is never checked by the language.


## Prerequisites
node-coverage works instrumenting your JavaScript code and serving those instrumented files to your browser from a web server. Therefore it depends on

* [Optimist](https://github.com/substack/node-optimist) library to parse command line arguments.
* [UglifyJS](https://github.com/mishoo/UglifyJS) to parse and instrument your files.
* [Express](https://github.com/visionmedia/express) to serve instrumented files.
* [Jade](https://github.com/visionmedia/jade) a templating engine to display coverage reports.
* [mkdirp](https://github.com/substack/node-mkdirp) utility for recursively create directories.

Those dependencies are checked-in inside `node_modules`.

## Usage
    node server.js -d "/var/www" -r "/var/log/reports"
This creates a server listenig on port `8080` serving the content of your folder `/var/www` and saving coverage reports inside `/var/log/reports`

Go to

    http://localhost:8080
and run your test suite. When complete you must call from your scripts the function

    $$_l.submit()
to submit the coverage report. The report is saved inside `/var/log/reports` as a JSON file.

To see the report go to the administrative interface on

    http://localhost:8787

### Supported options
* `-h` or `--help` list of options
* `-d` or `--doc-root` document root of the web server. All JS files in this folder will be instrumented. Default `/var/www`
* `-p` or `--port` web server port. Default `8080`
* `-r` or `--report-dir` directory where reports are stored. Default `/var/log/node-coverage`
* `-a` or `--admin-port` administrative server port. Default `8787`

### Instrumenting offline
The server instruments JavaScript files on each request. It's possible to instrument offline your files running

    node instrument.js /var/www/myApp /var/www/myInstrumentedApp

You can then run the server with

    node server.js -d /var/www/myInstrumentedApp