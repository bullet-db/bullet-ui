/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
/* globals blanket, module */

var options = {
  modulePrefix: 'bullet-ui',
  filter: '//.*bullet-ui/.*/',
  antifilter: '//.*(tests|template|helpers|validators).*/',
  loaderExclusions: ['bullet-ui/config/environment',
                     'bullet-ui/initializers/app-version',
                     'bullet-ui/initializers/container-debug-adapter',
                     'bullet-ui/initializers/data-adapter',
                     'bullet-ui/initializers/ember-data',
                     'bullet-ui/initializers/export-application-global',
                     'bullet-ui/initializers/injectStore',
                     'bullet-ui/initializers/local-storage-adapter',
                     'bullet-ui/initializers/store',
                     'bullet-ui/initializers/transforms',
                     'bullet-ui/initializers/truth-helpers',
                     'bullet-ui/initializers/viewport-config',
                     'bullet-ui/instance-initializers/ember-data',
                     'bullet-ui/controllers/array',
                     'bullet-ui/controllers/object',
                     'bullet-ui/services/moment',
                     'bullet-ui/services/scroller',
                     'bullet-ui/services/resize-detector',
                     'bullet-ui/components/ember-wormhole',
                     'bullet-ui/components/ember-scrollable',
                     'bullet-ui/components/power-select',
                     'bullet-ui/components/basic-dropdown',
                     'bullet-ui/components/light-table',
                     'bullet-ui/components/lt-head',
                     'bullet-ui/components/lt-body',
                     'bullet-ui/components/lt-foot',
                     'bullet-ui/components/lt-scrollable',
                     'bullet-ui/components/lt-infinity',
                     'bullet-ui/components/lt-spanned-row',
                     'bullet-ui/components/lt-column-resizer',
                     'bullet-ui/components/lt-row',
                     'bullet-ui/components/power-select/trigger',
                     'bullet-ui/components/resize-detector',
                     'bullet-ui/components/app-version',
                     'bullet-ui/components/as-scrollable',
                     'bullet-ui/components/radio-button',
                     'bullet-ui/components/radio-button-input',
                     'bullet-ui/components/tooltip-on-element',
                     'bullet-ui/components/tooltip-on-component',
                     'bullet-ui/components/ember-tether',
                     'bullet-ui/components/labeled-radio-button',
                     'bullet-ui/components/scroll-to'],
  enableCoverage: true,
  cliOptions: {
    reporters: ['lcov'],
    lcovOptions: {
      outputFile: 'lcov.info'
    }
  }
};
if (typeof exports === 'undefined') {
  blanket.options(options);
} else {
  module.exports = options;
}
