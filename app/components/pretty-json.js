/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@ember/component';
import JSONFormatterModule from 'npm:json-formatter-js';
const JSONFormatter = JSONFormatterModule.default;

export default Component.extend({
  classNames: ['pretty-json-container'],
  tagName: 'pre',
  data: null,
  defaultLevels: 2,

  didInsertElement() {
    this._super(...arguments);
    this.$().append(this.getRenderData());
  },

  didUpdateAttrs() {
    this._super(...arguments);
    this.$().empty().append(this.getRenderData());
  },

  getRenderData() {
    let formatter = new JSONFormatter(this.get('data'), this.get('defaultLevels'), { hoverPreviewEnabled: true });
    return formatter.render();
  }
});
