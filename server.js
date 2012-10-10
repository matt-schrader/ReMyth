var ReMyth = require('./ReMyth.js');

// Load a built-in node library
var HTTP = require('http');
// Load a couple third-party node modules
var Stack = require('stack');
var Creationix = require('creationix');
//var Creationix = require("/Users/matt/play/creationix/index.js");

var mdns = require('mdns');

// Listen on the alt-http port
var port = process.env.PORT || 8080;

var root = process.cwd();

// Stack up a server and start listening
HTTP.createServer(Stack(
  Creationix.log(),
  ReMyth.ReMythNavigate(),
  ReMyth.ReMythDVR(),
  ReMyth.ReMythFrontends(),
  Creationix.static("/app", root + "/app"),
  Creationix.static("/", "index.html")  
)).listen(port);

var formatHost = function(host) {
  if(host[host.length-1] === '.') {
    return host.substring(0, host.length-1);
  }
}

// Attach listener for mythfrontend service
global.frontends = {};
global.selectedFrontend = {}
var frontendBrowser = mdns.createBrowser(mdns.tcp('mythfrontend'));
frontendBrowser.on('serviceUp', function(service) {
  service.host = formatHost(service.host);

  global.frontends[service.name] = service;
  console.log(service);
});
frontendBrowser.on('serviceDown', function(service) {
  delete global.frontends[service.name];
});
frontendBrowser.start();

// Attach listener for master mythbackend service
var masterBackendBrowser = mdns.createBrowser(mdns.tcp('mythbackend-master'));
masterBackendBrowser.on('serviceUp', function(service) {
  service.host = formatHost(service.host);

  global.masterBackend = service;
  console.log(service);
});
masterBackendBrowser.on('servcieDown', function(service) {
  delete global.masterBackend;
});
masterBackendBrowser.start();

// Give the user a nice message on the standard output
console.log("Serving %s at http://localhost:%s/", root, port);