/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { computed, getProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isNone } from '@ember/utils';

export default Component.extend({
  querier: service(),
  classNames: ['result-viewer'],
  result: null,
  autoUpdate: true,
  selectedSegmentIndex: -1,
  selectedSegment: null,

  segmentNumberProperty: computed('settings', function() {
    let mapping = this.get('settings.defaultValues.metadataKeyMapping');
    let { windowSection, windowNumber } = getProperties(mapping, 'windowSection', 'windowNumber');
    return `metadata.${windowSection}.${windowNumber}`;
  }),

  isRunningQuery: alias('querier.isRunningQuery').readOnly(),

  hasError: computed('result.segments.[]', function() {
    let result = this.get('result.segments').some(segment => !isNone(segment.metadata.errors));
    console.log(this.get('result.segments.length'));
    return result;
  }),

  hasData: computed('result.segments.[]', function() {
    return !isEmpty(this.get('result.segments'));
  }).readOnly(),

  records: computed('result.segments.[]', function() {
    return this.get('result.segments.lastObject.records');
  }).readOnly(),

  metadata: computed('result.segments.[]', function() {
    return this.get('result.segments.lastObject.metadata');
  }).readOnly(),

  config: computed('result.{isRaw,isReallyRaw,isDistribution,isSingleRow}', function() {
    return {
      isRaw: this.get('result.isRaw'),
      isReallyRaw: this.get('result.isReallyRaw'),
      isDistribution: this.get('result.isDistribution'),
      isSingleRow: this.get('result.isSingleRow')
    };
  }).readOnly(),

  actions: {
    changeSegment(segment) {
      this.set('selectedSegment', segment);
    }
  }
});
