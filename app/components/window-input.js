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
  emitType: computed('query.window.emit.type', function() {
    return this.get('query.window.emit.type');
  }),

  includeType: computed('query.window.include.type', function() {
    return this.get('query.window.include.type');
  }),

  everyForRecordBasedWindow: alias('settings.defaultValues.everyForRecordBasedWindow').readOnly(),
  everyForTimeBasedWindow: alias('settings.defaultValues.everyForTimeBasedWindow').readOnly(),

  // Helper equalities for template
  isWindowless: computed('query.{isWindowless,aggregation.type}', function() {
    // Check if needing to change to the correct window when aggregation changes.
    // Some window types are not valid for some aggregation types.
    if (isEqual(this.get('query.aggregation.type'), AGGREGATIONS.get('RAW'))) {
      if (isEqual(this.get('includeType'), INCLUDE_TYPES.get('ALL'))) {
        this.replaceWindow(null, null, INCLUDE_TYPES.get('WINDOW'));
        this.set('includeType', INCLUDE_TYPES.get('WINDOW'));
      }
    } else if (isEqual(this.get('emitType'), EMIT_TYPES.get('RECORD'))) {
      this.replaceWindow(EMIT_TYPES.get('TIME'), this.get('everyForTimeBasedWindow'), null);
      this.set('emitType', EMIT_TYPES.get('TIME'));
    }
    return this.get('query.isWindowless');
  }).readOnly(),

  isTimeBasedWindow: equal('emitType', EMIT_TYPES.get('TIME')).readOnly(),
  isRecordBasedWindow: equal('emitType', EMIT_TYPES.get('RECORD')).readOnly(),
  isRawAggregation: equal('query.aggregation.type', AGGREGATIONS.get('RAW')).readOnly(),

  recordBasedWindowDisabled: computed('isRawAggregation', 'disabled', function() {
    return this.get('disabled') || !this.get('isRawAggregation');
  }).readOnly(),

  everyDisabled: or('isRecordBasedWindow', 'disabled').readOnly(),
  includeDisabled: or('isRecordBasedWindow', 'disabled').readOnly(),

  allIncludeTypeDisabled: computed('isRawAggregation', 'includeDisabled', function() {
    return this.get('includeDisabled') || this.get('isRawAggregation');
  }).readOnly(),

  everyFieldName: computed('isRecordBasedWindow', function() {
    return this.get('isRecordBasedWindow') ? 'every (records)' : 'every (seconds)';
  }).readOnly(),

  replaceWindow(emitType, emitEvery, includeType) {
    return this.get('queryManager').replaceWindow(this.get('query'), emitType, emitEvery, includeType);
  },

  addWindow() {
    this.set('emitType', EMIT_TYPES.get('TIME'));
    this.set('includeType', INCLUDE_TYPES.get('WINDOW'));
    return this.get('queryManager').addWindow(this.get('query'));
  },

  removeWindow() {
    return this.get('queryManager').deleteWindow(this.get('query'));
  },

  actions: {
    changeEmitType(emitType) {
      if (isEqual(emitType, EMIT_TYPES.get('RECORD'))) {
        this.set('includeType', INCLUDE_TYPES.get('WINDOW'));
        this.replaceWindow(emitType, this.get('everyForRecordBasedWindow'), INCLUDE_TYPES.get('WINDOW'));
      } else {
        this.replaceWindow(emitType, this.get('everyForTimeBasedWindow'));
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
