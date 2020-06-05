/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { equal, or, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEqual } from '@ember/utils';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';

export default Component.extend({
  classNames: ['window-input'],
  query: null,
  disabled: false,
  queryManager: service(),

  EMIT_TYPES: EMIT_TYPES,
  INCLUDE_TYPES: INCLUDE_TYPES,

  // These *Type computed properties exist because ember-radio-button will set their value locally. Once set,
  // they are independent of the original property. This means they are only used on initial component render.
  emitType: computed('query.window.emitType', function() {
    return this.get('query.window.emitType');
  }),

  includeType: computed('query.window.includeType', function() {
    return this.get('query.window.includeType');
  }),

  // Helper equalities for template
  defaultEveryForRecordWindow: alias('settings.defaultValues.everyForRecordBasedWindow').readOnly(),
  defaultEveryForTimeWindow: alias('settings.defaultValues.everyForTimeBasedWindow').readOnly(),
  isWindowless: alias('query.isWindowless').readOnly(),
  isTimeBasedWindow: equal('emitType', EMIT_TYPES.get('TIME')).readOnly(),
  isRecordBasedWindow: equal('emitType', EMIT_TYPES.get('RECORD')).readOnly(),
  isRawAggregation: equal('query.aggregation.type', AGGREGATIONS.get('RAW')).readOnly(),

  recordBasedWindowDisabled: computed('isRawAggregation', 'disabled', function() {
    return this.disabled || !this.isRawAggregation;
  }).readOnly(),
  everyDisabled: or('isRecordBasedWindow', 'disabled').readOnly(),
  includeDisabled: or('isRecordBasedWindow', 'disabled').readOnly(),
  allIncludeTypeDisabled: computed('isRawAggregation', 'includeDisabled', function() {
    return this.includeDisabled || this.isRawAggregation;
  }).readOnly(),

  everyFieldName: computed('isRecordBasedWindow', function() {
    return `Frequency (${this.isRecordBasedWindow ? 'records' : 'seconds'})`;
  }).readOnly(),

  replaceWindow(emitType, emitEvery, includeType) {
    return this.queryManager.replaceWindow(this.query, emitType, emitEvery, includeType);
  },

  addWindow() {
    this.set('emitType', EMIT_TYPES.get('TIME'));
    this.set('includeType', INCLUDE_TYPES.get('WINDOW'));
    return this.queryManager.addWindow(this.query);
  },

  deleteWindow() {
    return this.queryManager.deleteWindow(this.query);
  },

  actions: {
    changeEmitType(emitType) {
      if (isEqual(emitType, EMIT_TYPES.get('RECORD'))) {
        this.set('includeType', INCLUDE_TYPES.get('WINDOW'));
        this.replaceWindow(emitType, this.defaultEveryForRecordWindow, INCLUDE_TYPES.get('WINDOW'));
      } else {
        this.replaceWindow(emitType, this.defaultEveryForTimeWindow, this.includeType);
      }
    },

    changeIncludeType(includeType) {
      this.replaceWindow(this.emitType, this.get('query.window.emit.every'), includeType);
    },

    addWindow() {
      this.addWindow();
    },

    deleteWindow() {
      this.deleteWindow();
    }
  }
});
