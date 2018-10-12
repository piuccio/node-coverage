var url = require("url");
var http = require("http");
var httpProxy = require("http-proxy");
var instrument = require("../instrument");
var fileSystem = require("../fileSystem");
var common = require("./common");
var bodyParser = require("connect").bodyParser;
var restreamer = require("connect-restreamer");

var options, administrationRoot;

function proxyServer (request, response, proxy) {
	var parsedRequest = url.parse(request.url);

	if (parsedRequest.path == "/node-coverage-store") {
		common.saveCoverage(request.body, null, administrationRoot, function (error) {
			if (error) {
				response.writeHead(500);
				response.write(error);
				response.end();
			} else {
				response.end();
			}
		});
	} else if (fileSystem.getInterpreter(request.url, "")) {
		// There's at least one interpreter to handle this
		var proxyedRequest = http.request(parsedRequest, function (proxyedResponse) {
			proxyedResponse.setEncoding('utf-8');

			var buffer = [];
			
			proxyedResponse.on('data', function (chunk) {
				buffer.push(chunk);
			});

			proxyedResponse.on('end', function () {
				var code = instrument(parsedRequest.path, buffer.join(""), options);
				response.end(code.clientCode);
			});
		}).on('error', function(error) {
			response.writeHead(500);
			response.write(error.message);
			response.end();
		});

		proxyedRequest.end();
	} else {
		proxy.proxyRequest(request, response, {
			host: parsedRequest.host,
			port: parsedRequest.port || 80
		});
	}
}

exports.start = function (port, adminRoot, coverageOptions) {
	options = coverageOptions;
	administrationRoot = adminRoot;

	httpProxy.createServer(
		bodyParser(),
		restreamer(),
		proxyServer
	).listen(port);
};