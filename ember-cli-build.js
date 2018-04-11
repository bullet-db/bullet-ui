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

  // FileSaver
  app.import('bower_components/filesaver/FileSaver.js');

  // pivottable
  app.import('bower_components/c3/c3.js');
  app.import('bower_components/c3/c3.css');
  app.import('bower_components/d3/d3.js');
  // Manually importing jquery-ui dependencies to keep clashes with bootstrap a minimum
  // Just need the sortable plugin and all of its dependency chain
  app.import('bower_components/jquery-ui/ui/version.js');
  app.import('bower_components/jquery-ui/ui/widget.js');
  app.import('bower_components/jquery-ui/ui/data.js');
  app.import('bower_components/jquery-ui/ui/ie.js');
  app.import('bower_components/jquery-ui/ui/plugin.js');
  app.import('bower_components/jquery-ui/ui/scroll-parent.js');
  app.import('bower_components/jquery-ui/ui/widgets/mouse.js');
  app.import('bower_components/jquery-ui/ui/widgets/sortable.js');
  // Core pivottable
  app.import('bower_components/pivottable/dist/pivot.js');
  app.import('bower_components/pivottable/dist/pivot.css');
  app.import('bower_components/pivottable/dist/c3_renderers.js');
  app.import('bower_components/pivottable/dist/export_renderers.js');

  app.import('bower_components/stomp-websocket/lib/stomp.js');
  app.import('bower_components/sockjs-client/dist/sockjs.min.js');

  return app.toTree();
};
