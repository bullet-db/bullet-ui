/* jshint node: true */

var express = require('express');
var entrypoint = require('./server/index.js');

var app = express();
entrypoint(app);
var host = process.env.HOST_NAME || 'localhost';
var port = process.env.PORT || 80;
app.listen(port);
console.log('Express Server listening at http://' + host + ':' + port);
