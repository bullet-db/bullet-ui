/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['result-viewer'],
  result: null,

  hasSegments: computed('result.segments.[]', function() {
    return this.get('result.segments.length') > 0;
  }).readOnly(),

  records: computed('result.segments.[]', function() {
    return this.get('result.segments.lastObject.records')
  }).readOnly(),

  metadata: computed('result.segments.[]', function() {
    return this.get('result.segments.lastObject.metadata')
  }).readOnly()
});
