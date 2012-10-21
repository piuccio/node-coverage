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

## Interpreters

node-coverage has a modular system for interpreting and instrumenting JavaScript files. This allows you to create an interpreter for any type of file.

The base interpreter is able to instrument standard JavaScript files, but you can create your own adding a module inside `lib/interpreters` with the following structure

    exports.filter = {
       files : /.*/,      // a regular expression matching file names
       content : /\/\!/   // a regular expression matching file content
    };
    
    exports.interpret = function (file, content, options) {}

Filter object specifies which files are handled by the module.

* `files` is mandatory, it's a regular expression matching the file name, examples are `/.*/` for any file, `/\.js$/` for JavaScript files
* `content` is optional, it's a regular expression matching the file content. File content are checked against this expression only if their file name matches `filter.files`.

`interpret` is the function that instruments the code. It takes 3 parameters

* `file` File name
* `content` File content
* `options` Coverage options
	* `function` boolean, enable function coverage
	* `condition` boolean, enable condition coverage

this function must return an object containing

* `clientCode` the instrumented code, this is sent to the client
* `highlightedCode` an array of file lines, this matches the original file statements to the corresponding line of code.