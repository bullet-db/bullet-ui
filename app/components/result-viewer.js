/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias, none } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty, isNone } from '@ember/utils';

export default Component.extend({
  classNames: ['result-viewer'],
  querier: service(),

  query: null,
  result: null,
  selectedWindow: null,
  autoUpdate: true,
  aggregateMode: false,
  jitter: -500,

  isRunningQuery: alias('querier.isRunningQuery').readOnly(),
  autoAggregateMode: alias('result.isRaw').readOnly(),
  errorWindow: alias('result.errorWindow').readOnly(),
  hasData: alias('result.hasData').readOnly(),
  numberOfWindows: alias('result.windows.length').readOnly(),
  isTimeWindow: alias('query.window.isTimeBased').readOnly(),
  windowEmitEvery: alias('query.window.emit.every').readOnly(),

  hasError: computed('errorWindow', function() {
    return !isNone(this.get('errorWindow'));
  }).readOnly(),

  records: computed('autoUpdate', 'selectedWindow', 'result.windows.[]', function() {
    return this.getSelectedWindow('records');
  }).readOnly(),

  metadata: computed('hasError', 'autoUpdate', 'selectedWindow', 'result.windows.[]', function() {
    if (this.get('hasError')) {
      return this.get('errorWindow.metadata');
    }
    return this.getSelectedWindow('metadata');
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
