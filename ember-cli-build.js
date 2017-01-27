/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'ember-cli-bootstrap-sassy': {
      'glyphicons': true
    },
    // Lets us just do import bootstrap etc from this base path
    sassOptions: {
      includePaths: [
        'bower_components/bootstrap-sass/assets/stylesheets'
      ]
    },
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
  // app.import('bower_components/jquery/dist/jquery.js');
  // app.import('bower_components/bootstrap/dist/js/bootstrap.js');
  // app.import('bower_components/doT/doU.js');
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

  return app.toTree();
};
