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
* `--proxy` Proxy mode. You can use node-coverage to instrument files on a differnt host.
* `-v` or `--verbose` Enable more verbose logging information. Default `false`

By default function coverage is disabled, to enable it you can run

    node server.js --function

or

    node server.js --no-condition

to disable condition coverage.

You can exclude some files or folders using

    node server.js -i lib/minified -i lib/jquery.js