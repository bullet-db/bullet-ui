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
  selectedWindowIndex: -1,
  selectedWindow: null,

  windowNumberProperty: computed('settings', function() {
    let mapping = this.get('settings.defaultValues.metadataKeyMapping');
    let { windowSection, windowNumber } = getProperties(mapping, 'windowSection', 'windowNumber');
    return `metadata.${windowSection}.${windowNumber}`;
  }).readOnly(),

  isRunningQuery: alias('querier.isRunningQuery').readOnly(),

  hasError: computed('result.windows.[]', function() {
    let result = this.get('result.windows').some(window => !isNone(window.metadata.errors));
    return result;
  }).readOnly(),

  hasData: computed('result.windows.[]', function() {
    return !isEmpty(this.get('result.windows'));
  }).readOnly(),

  records: computed('result.windows.[]', function() {
    return this.get('result.windows.lastObject.records');
  }).readOnly(),

  metadata: computed('result.windows.[]', function() {
    return this.get('result.windows.lastObject.metadata');
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
    changeWindow(selectedWindow) {
      this.set('selectedWindow', selectedWindow);
    }
  }
});
