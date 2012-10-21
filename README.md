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
* [mkdirp](https://github.com/substack/node-mkdirp) utility for recursively create directories.
* [Connect](https://github.com/senchalabs/connect) middleware layer
* [node-http-proxy](https://github.com/nodejitsu/node-http-proxy) http proxy for node.js

Those dependencies can be installed (from the node-coverage directory) with:

    npm install

Unit tests run on [Nodeunit](https://github.com/caolan/nodeunit). After cloning the repository you can run them with

    node instrument.js -t

The administrative interface uses for "Stats & Graph" page

* [jQuery](http://jquery.com)
* [Highcharts](http://www.highcharts.com/) charting library written in JavaScript

## Documentation

### Server

node-coverage comes with a stand alone server able to instrument your JavaScript files on the fly and collect coverage reports

* [Usage](https://github.com/piuccio/node-coverage/tree/master/doc/SERVER.md)
* [JSON API](https://github.com/piuccio/node-coverage/tree/master/doc/JSON.md)

### Command Line

Command line utilities allow you to instrument your files offline. Instrumented files can be deployed on your own web server or used in other node applications.

You can also use the same tools for your own node.js project

* [Usage](https://github.com/piuccio/node-coverage/tree/master/doc/COMMAND_LINE.md)
* [Use node-coverage in your Node.js application](https://github.com/piuccio/node-coverage/tree/master/doc/NODE.md)
* [Create your own interpreter](https://github.com/piuccio/node-coverage/tree/master/doc/INTERPRETERS.md).

###  Proxy

node-coverage can also be used as an http proxy to instrument files hosted on a different machine.
This is particularly useful if your tests require not only static files but the whole server side logic (PHP, Tomcat, ...).

The proxy can also be used to measure how much JavaScript is actually used to load the landing page of your website and compare this measure with other websites in your industry

* [Usage](https://github.com/piuccio/node-coverage/tree/master/doc/PROXY.md)