/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias, none, and, not } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty, isNone } from '@ember/utils';

export default Component.extend({
  classNames: ['result-viewer'],
  querier: service(),

  query: null,
  result: null,
  selectedWindow: null,
  autoUpdate: true,
  // Tweaks the time for the window duration by this to adjust for Ember scheduling delays
  jitter: -300,

  isRunningQuery: alias('querier.isRunningQuery').readOnly(),
  isRaw: alias('result.isRaw').readOnly(),
  errorWindow: alias('result.errorWindow').readOnly(),
  hasData: alias('result.hasData').readOnly(),
  numberOfWindows: alias('result.windows.length').readOnly(),
  windowEmitEvery: alias('query.window.emit.every').readOnly(),
  isTimeWindow: alias('query.window.isTimeBased').readOnly(),
  isRecordWindow: not('isTimeWindow').readOnly(),
  isRawRecordWindow: and('isRecordWindow', 'isRaw').readOnly(),
  aggregateMode: alias('isRawRecordWindow').readOnly(),

  showAutoUpdate: computed('hasError', 'isRawRecordWindow', function() {
    return !(this.get('hasError') || this.get('aggregateMode'));
  }),

  hasError: computed('errorWindow', function() {
    return !isNone(this.get('errorWindow'));
  }).readOnly(),

  metadata: computed('hasError', 'autoUpdate', 'selectedWindow', 'result.windows.[]', function() {
    return this.get('hasError') ? this.get('errorWindow.metadata') : this.getSelectedWindow('metadata')
  }).readOnly(),

  records: computed('autoUpdate', 'aggregateMode', 'selectedWindow', 'result.windows.[]', function() {
    return this.get('aggregateMode') ? this.getAllWindowRecords() : this.getSelectedWindow('records')
  }).readOnly(),

  queryDuration: computed('query.duration', function() {
    return this.get('query.duration') * 1000;
  }).readOnly(),

  windowDuration: computed('windowEmitEvery', function() {
    return this.get('jitter') + this.get('windowEmitEvery') * 1000;
  }).readOnly(),

  config: computed('result.{isRaw,isReallyRaw,isDistribution,isSingleRow}', function() {
    return {
      isRaw: this.get('result.isRaw'),
      isReallyRaw: this.get('result.isReallyRaw'),
      isDistribution: this.get('result.isDistribution'),
      isSingleRow: this.get('result.isSingleRow'),
      pivotOptions: this.get('result.pivotOptions')
    };
  }).readOnly(),

  getSelectedWindow(property) {
    let windowProperty = this.get(`result.windows.lastObject.${property}`);
    if (!this.get('autoUpdate')) {
      let selectedWindow = this.get('selectedWindow');
      windowProperty = isNone(selectedWindow) ? windowProperty : selectedWindow[property];
    }
    return windowProperty;
  },

  getAllWindowRecords() {
    return this.get('result.windows').getEach('records').reduce((p, c) => p.concat(c), []);;
  },

  actions: {
    changeWindow(selectedWindow) {
      this.set('selectedWindow', selectedWindow);
      this.set('autoUpdate', false);
    },

    changeAutoUpdate(autoUpdate) {
      // Turn On => reset selectedWindow. Turn Off => Last window
      this.set('selectedWindow', autoUpdate ? null : this.get('result.windows.lastObject'));
      this.set('autoUpdate', autoUpdate);
    }
  }
});
