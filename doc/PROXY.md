## Proxy

node-coverage can also be used as an http proxy to instrument files hosted on a different machine.

    node server.js --proxy -p 8000

Start the instrumentation server in proxy mode. You can configure your browser to use an http proxy targeting `localhost` on port `8000`

You can also enable or disable condition or function coverage using the same options of a standalone server or specify a differnt path where to store coverage reports.

    node server.js --proxy --no-condition -r ~/reports

At the moment it only support http, not https.