/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var configuration = require('../config/host-settings.json');

// Set the environment based on a NODE_ENV variable.
var env = process.env.NODE_ENV;

var rawSettings = configuration[env] || configuration.default;
var settings = encodeURIComponent(JSON.stringify(rawSettings));
var indexFilePath = process.cwd() + '/dist/index.html';

console.log('Loaded settings for: ', env);
console.log('\nSettings: \n', rawSettings);

module.exports = function(app) {
  app.use(simpleServeStatic({ directory: 'dist' }));
  app.use(serveIndex());
};

function serveIndex() {
  return function(req, res, next) {
    var $;

    // Exception for live reload
    // If you want to access tests then add "|| req.url.startsWith('/tests')
    if (req.url === '/ember-cli-live-reload.js') {
      return next();
    }

    fs.readFile(indexFilePath, { encoding: 'utf8' }, function(err, data) {
      $ = cheerio.load(data);
      // Sticking the host settings into head meta as app-settings.
      $('head').prepend(meta('app-settings', settings));
      res.status(200).send($.html());
    });
  };
}

function simpleServeStatic(options) {
  return function(req, res, next) {
    var assetPath;

    // Requests to / will be hit by this.
    if (!path.extname(req.path)) {
      return next();
    }

    if (options.directory) {
      assetPath = path.join(options.directory, req.path);
    } else if (options.file) {
      assetPath = options.file;
    }

    if (!assetPath) {
      return next();
    }

    res.sendFile(process.cwd() + '/' + assetPath, function(sendError) {
      if (sendError) {
        return next();
      }
    });
  };
}

function meta(name, content) {
  var $ = cheerio.load('<meta name="' + name + '" />');
  return $('meta').attr('content', content);
}


