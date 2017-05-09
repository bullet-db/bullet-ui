/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'ember-cli-babel': {
      includePolyfill: true
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  // Query Builder
  app.import('bower_components/jquery-extendext/jQuery.extendext.js');
  app.import('bower_components/doT/doT.js');
  app.import('bower_components/interact/interact.js');
  app.import('bower_components/jQuery-QueryBuilder/dist/js/query-builder.js');
  app.import('bower_components/jQuery-QueryBuilder/dist/css/query-builder.default.css');
  // Query Builder Standalone plugins
  app.import('bower_components/jQuery-QueryBuilder-Subfield/query-builder-subfield.js');
  app.import('bower_components/jQuery-QueryBuilder-Subfield/query-builder-subfield.css');
  app.import('bower_components/jQuery-QueryBuilder-Placeholders/query-builder-placeholders.js');

  app.import('bower_components/filesaver/FileSaver.js');

  // pivottable
  app.import('bower_components/c3/c3.js');
  app.import('bower_components/c3/c3.css');
  app.import('bower_components/d3/d3.js');
  app.import('bower_components/jquery-ui/jquery-ui.js');
  app.import('bower_components/pivottable/dist/pivot.js');
  app.import('bower_components/pivottable/dist/pivot.css');
  app.import('bower_components/pivottable/dist/c3_renderers.js');
  app.import('bower_components/pivottable/dist/export_renderers.js');

  // Must load after to replace jquery-ui tooltips with bootstrap
  app.import('bower_components/bootstrap/dist/js/bootstrap.js');

  return app.toTree();
};
