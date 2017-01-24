/* jshint node: true */

var express = require('express');
var entrypoint = require('./server/index.js');
var host, port;

var app = express();
entrypoint(app);
if (require.main === module) {
  // this package is being used as an app
  host = process.env.HOST_NAME || 'localhost';
  port = process.env.PORT || 80;
  app.listen(port);
  console.log('Express Server listening at http://' + host + ':' + port);
} else {
  // this package is being used as a library
  module.exports = app;
}
