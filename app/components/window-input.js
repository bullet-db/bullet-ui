/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { equal, or } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEqual } from '@ember/utils';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';

const DEFAULT_EVERY_FOR_RECORD = 1;
const DEFAULT_EVERY_FOR_TIME = 2;

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

  aggregationTypeChanged: observer('query.aggregation.type', function() {
    if (isEqual(this.get('query.aggregation.type'), AGGREGATIONS.get('RAW'))) {
      if (isEqual(this.get('includeType'), INCLUDE_TYPES.get('ALL'))) {
        this.replaceWindow(null, null, INCLUDE_TYPES.get('WINDOW'));
        this.set('includeType', INCLUDE_TYPES.get('WINDOW'));
      }
    } else if (isEqual(this.get('emitType'), EMIT_TYPES.get('RECORD'))) {
      this.replaceWindow(EMIT_TYPES.get('TIME'), DEFAULT_EVERY_FOR_TIME, null);
      this.set('emitType', EMIT_TYPES.get('TIME'));
    }
  }),

  // Helper equalities for template
  isWindowless: computed('query.isWindowless', function() {
    return this.get('query.isWindowless');
  }),
  isTimeBasedWindow: equal('emitType', EMIT_TYPES.get('TIME')).readOnly(),
  isRecordBasedWindow: equal('emitType', EMIT_TYPES.get('RECORD')).readOnly(),
  isAggregationRaw: equal('query.aggregation.type', AGGREGATIONS.get('RAW')).readOnly(),
  recordBasedWindowDisabled: computed('isAggregationRaw', 'disabled', function() {
    return this.get('disabled') || !this.get('isAggregationRaw');
  }).readOnly(),
  everyDisabled: or('isRecordBasedWindow', 'disabled').readOnly(),
  includeDisabled: or('isRecordBasedWindow', 'disabled').readOnly(),
  allIncludeTypeDisabled: computed('isAggregationRaw', 'includeDisabled', function() {
    return this.get('includeDisabled') || this.get('isAggregationRaw');
  }).readOnly(),
  everyFieldName: computed('isRecordBasedWindow', function() {
    if (this.get('isRecordBasedWindow')) {
      return 'every (records)';
    }
    return 'every (seconds)';
  }).readOnly(),

  replaceWindow(emitType, emitEvery, includeType) {
    return this.get('queryManager').replaceWindow(this.get('query'), emitType, emitEvery, includeType);
  },

  addWindow() {
    return this.get('queryManager').addWindow(this.get('query'));
  },

  removeWindow() {
    this.set('emitType', EMIT_TYPES.get('TIME'));
    this.set('includeType', INCLUDE_TYPES.get('WINDOW'));
    return this.get('queryManager').removeWindow(this.get('query'));
  },

  actions: {
    changeEmitType(emitType) {
      if (isEqual(emitType, EMIT_TYPES.get('RECORD'))) {
        this.set('includeType', INCLUDE_TYPES.get('WINDOW'));
        this.replaceWindow(emitType, DEFAULT_EVERY_FOR_RECORD, INCLUDE_TYPES.get('WINDOW'));
      } else {
        this.replaceWindow(emitType, DEFAULT_EVERY_FOR_TIME, null);
      }
    },

    changeIncludeType(includeType) {
      this.replaceWindow(null, null, includeType);
    },

    addWindow() {
      this.addWindow();
    },

    removeWindow() {
      this.removeWindow();
    }
  }
});
