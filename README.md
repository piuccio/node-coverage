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

Unit tests run on [Nodeunit](https://github.com/caolan/nodeunit), which is included in the stream as a submodule.

The administrative interface uses for "Stats & Graph" page

* [jQuery](http://jquery.com)
* [Highcharts](http://www.highcharts.com/) charting library written in JavaScript

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


It's also possible to specify a report name from the `submit` function

    $$_l.submit("myTestCaseReport")


### Supported options

* `-h` or `--help` list of options
* `-d` or `--doc-root` document root of the web server. All JS files in this folder will be instrumented. Default `/var/www`
* `-p` or `--port` web server port. Default `8080`
* `-r` or `--report-dir` directory where reports are stored. Default `/var/log/node-coverage`
* `-a` or `--admin-port` administrative server port. Default `8787`
* `--condition`, `--no-condition` Enable or disable condition coverage. By default it's enabled.
* `--function`, `--no-function` Enable or disable function coverage. By default it's disabled.
* `--session`, `--no-session` Enable or disable session storage for information not strictly needed by the browser. By default it's enabled. Disabling this means that more code is sent to and from the client.
* `-i` or `--ignore` Ignore file or folder. This file/folder won't be instrumented. Path is relative to document root.

By default function coverage is disabled, to enable it you can run

    node server.js --function

or

    node server.js --no-condition

to disable condition coverage.

You can exclude some files or folders using

    node server.js -i lib/minified -i lib/jquery.js



## Instrumenting offline

The server instruments JavaScript files on each request. It's possible to instrument offline your files running

    node instrument.js /var/www/myApp /var/www/myInstrumentedApp

You can then run the server with

    node server.js -d /var/www/myInstrumentedApp


### Supported options

* `-h` or `--help` list of options
* `-t` ot `test` run unit tests
* `--condition`, `--no-condition` enable or disable condition coverage. By default it's enabled.
* `--function`, `--no-function` enable or disable function coverage. By default it's disabled.
* `-i` or `--ignore` Ignore file or folder. This file/folder is copied in target folder but not instrumented. Path relative to the source folder.
* `-x` or `--exclude` Exclude file or folder. This file/folder won't be copied in target folder. Path relative to the source folder.

By default function coverage is disabled, to enable it you can run

    node instrument.js --function /var/www/myApp /var/www/myInstrumentedApp

or

    node instrument.js --no-condition /var/www/myApp /var/www/myInstrumentedApp

to disable condition coverage.

The code generated offline is equal to the one generated by the server when session storage is disabled with `--no-session`.

You can also instrument a single file launching

    node instrument.js myScript.js

The output is sent to standard input.

The command

    node instrument /var/www/myApp /var/www/myInstrumentedApp -x .git -i lib/minified

copies and instrument all files inside `myApp` excluding `.git` which is not copied at all and `lib/minified` which is copied but won't be instrumented for coverage.

#### Unit Test

In order to run unit tests after cloning this repository you need to run

    git submodule init
    git submodule update

and after that

    node instrument.js -t


## JSONP API

Once the server is started you can access the built-in adminitrative interface or use it's JSONP API to get reports as JSON objects and use them in your own tools.

You can target any page in the administrative interface adding a `?callback=myJsonPCallback` GET parameter.
Empty space characters should be converted in `%20`.

### Get the list of reports

    http://localhost:8787/?callback=myCallback

The returned JSON is an Array of objects containing

* `id` : report name
* `time` : creation timestamp
* `date` : creation date

### Get the details of a report

    http://localhost:8787/r/[id]?callback=myCallback

Replace `[id]` with the actual report's id.

The returned JSON has the following structure

* `global`
  * `statements`
    * `total` : total number of lines,
    * `covered` : number of exectuded statement,
    * `percentage` : percentage of covered statements, float 0<>100,
  * `conditions`
    * `total` : total number of conditions,
    * `coveredTrue` : number of conditions evaluated to true,
    * `coveredFalse` : number of conditions evaluated to false,
    * `percentage` : percentage of conditions evaluated both true and false,
  * `functions`
    * `total` : total number of functions,
    * `covered` : number of functions that have been called (including empty functions),
    * `percentage` : percentage of functions called
* `files` : map of single reports for every file. The key being the file name and the value being the file report
* `functions` : history of all covered functions

By default files reports are sorted alphabetically by file name.

You can change the sorting criteria targeting

    http://localhost:8787/r/[id]/sort/[what]/[how]?callback=myCallback

Where

* `what` is either `file` for alphabetical sort or `statement`, `condition` or `function` to sort according to the desired metric.
* `how` is either `asc` or `desc`

### Get the statistics of a report

    http://localhost:8787/stat/[id]?callback=myCallback

Replace `[id]` with the actual report's id.

The returned JSON has the following structure

* `unused` : number of unused statements
* `byFile` : object where the key is a file name and the value is the number of unused statements
* `byPackage` : group unused statements by "package" or folder.

### Get a file report

    http://localhost:8787/r/[id]/file/[fileName]?callback=myCallback

Slashes in `fileName` must be converted into `+`

The returned JSON contains

*  `code` : _highlighted_ code
  * `src` : array (one entry per line of code) where value are object with
    * `s` : source line
    * `l` : lineid of the instrumented function
    * `c` : list of conditions (array)
  * `fns` : object mapping a function id to the generated line of code
* `statements`
  * `total` : total number of lines,
  * `covered` : number of exectuded statement,
  * `detail` : coverage detail for every line, how many times that statement was called,
  * `percentage` : percentage of covered statements, float 0<>100,
* `conditions`
  * `total` : total number of conditions,
  * `coveredTrue` : number of conditions evaluated to true,
  * `coveredFalse` : number of conditions evaluated to false,
  * `detail` : list of conditions that evaluated 'true' or 'false' and 'all' for both
  * `percentage` : percentage of conditions evaluated both true and false (100 if no conditions),
* `functions`
  * `total` : total number of functions,
  * `covered` : number of functions that have been called (including empty functions),
  * `percentage` : percentage of functions called,
  * `detail` : coverage detail of functions, how many times the function was called

### Merge multiple reports

    http://localhost:8787/merge/?report=[id]&report=[id]?callback=myCallback

Where `id` is the report name. It's possible to merge more than two reports adding extra `&report=[id]`

The returned JSON has the same structure of a single report.