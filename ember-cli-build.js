/* eslint-env node */
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'ember-cli-babel': {
      includePolyfill: true
    },
    'ember-cli-bootstrap-sassy': {
      glyphicons: false
    },
    'ember-font-awesome': {
      removeUnusedIcons: EmberApp.env() === 'production',
      useScss: true,
      useLess: false
    },
    autoImport: {
      alias: {
        // Replaced browserify-zlib with a rollup (that was needed to get node primitives) but it included zlib already
        'rollup-plugin-node-builtins': 'node-builtins'
      }
      /*
      // Enable this if jquery is not being bound to by our jquery plugins
      webpack: {
        externals: { jquery: 'jQuery' }
      }
      */
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
  app.import('node_modules/jquery-extendext/jquery-extendext.js');
  app.import('node_modules/dot/doT.js');
  app.import('node_modules/interactjs/dist/interact.js');
  app.import('node_modules/jQuery-QueryBuilder/dist/js/query-builder.js');
  app.import('node_modules/jQuery-QueryBuilder/dist/css/query-builder.default.css');
  // Query Builder Standalone plugins
  app.import('node_modules/jQuery-QueryBuilder-Subfield/query-builder-subfield.js');
  app.import('node_modules/jQuery-QueryBuilder-Subfield/query-builder-subfield.css');
  app.import('node_modules/jQuery-QueryBuilder-Placeholders/query-builder-placeholders.js');

  // FileSaver
  app.import('node_modules/file-saver/dist/FileSaver.js');

  // pivottable
  app.import('node_modules/c3/c3.js');
  app.import('node_modules/c3/c3.css');
  app.import('node_modules/d3/build/d3.js');
  // Manually importing jquery-ui dependencies to keep clashes with bootstrap a minimum
  // Just need the sortable plugin and all of its dependency chain
  app.import('node_modules/jquery-ui/ui/version.js');
  app.import('node_modules/jquery-ui/ui/widget.js');
  app.import('node_modules/jquery-ui/ui/data.js');
  app.import('node_modules/jquery-ui/ui/ie.js');
  app.import('node_modules/jquery-ui/ui/plugin.js');
  app.import('node_modules/jquery-ui/ui/scroll-parent.js');
  app.import('node_modules/jquery-ui/ui/widgets/mouse.js');
  app.import('node_modules/jquery-ui/ui/widgets/sortable.js');
  // Core pivottable
  app.import('node_modules/pivottable/dist/pivot.js');
  app.import('node_modules/pivottable/dist/pivot.css');
  app.import('node_modules/pivottable/dist/c3_renderers.js');
  app.import('node_modules/pivottable/dist/export_renderers.js');

  return app.toTree();
};
