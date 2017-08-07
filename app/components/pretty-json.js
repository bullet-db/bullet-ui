/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import JSONFormatterModule from 'npm:json-formatter-js';

export default Ember.Component.extend({
  classNames: ['pretty-json-container'],
  tagName: 'pre',
  data: null,
  defaultLevels: 2,

  didInsertElement() {
    this._super(...arguments);
    const JSONFormatter = JSONFormatterModule.default;
    let formatter = new JSONFormatter(this.get('data'), this.get('defaultLevels') , { hoverPreviewEnabled: true });
    this.$().append(formatter.render());
  }
});
