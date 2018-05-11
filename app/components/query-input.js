/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { resolve, reject } from 'rsvp';
import $ from 'jquery';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { isEqual } from '@ember/utils';
import { SUBFIELD_SEPARATOR } from 'bullet-ui/models/column';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { EMIT_TYPES } from 'bullet-ui/models/window';
import BuilderAdapter from 'bullet-ui/mixins/builder-adapter';

export default Component.extend(BuilderAdapter, {
  queryBuilderClass: 'builder',
  queryBuilderElement: computed('queryBuilderClass', function() {
    return `.${this.get('queryBuilderClass')}`;
  }),
  queryBuilderInputs: computed('queryBuilderElement', function() {
    let element = this.get('queryBuilderElement');
    return `${element} input, ${element} select, ${element} button`;
  }),
  subfieldSeparator: SUBFIELD_SEPARATOR,
  subfieldSuffix: `${SUBFIELD_SEPARATOR}*`,
  query: null,
  queryManager: service(),
  scroller: service(),
  schema: null,
  isListening: false,
  listenDuration: 0,
  hasError: false,
  hasSaved: false,

  columns: computed('schema', function() {
    let schema = this.get('schema');
    return this.builderFilters(schema);
  }).readOnly(),

  showAggregationSize: computed('query.{aggregation.type,window.emitType,isWindowless}', function() {
    return isEqual(this.get('query.aggregation.type'), AGGREGATIONS.get('RAW')) &&
      (this.get('query.isWindowless') || isEqual(this.get('query.window.emitType'), EMIT_TYPES.get('TIME')));
  }),

  didInsertElement() {
    this._super(...arguments);
    let element = this.get('queryBuilderElement');
    let options = this.builderOptions();
    options.filters = this.get('columns');

    this.$(element).queryBuilder(options);

    let rules = this.get('query.filter.clause');
    if (rules && !$.isEmptyObject(rules)) {
      this.$(element).queryBuilder('setRules', rules);
    } else {
      this.$(element).queryBuilder('setRules', this.get('emptyClause'));
    }
  },

  isCurrentFilterValid() {
    let element = this.get('queryBuilderElement');
    return this.$(element).queryBuilder('validate');
  },

  currentFilterClause() {
    let element = this.get('queryBuilderElement');
    return this.$(element).queryBuilder('getRules');
  },

  currentFilterSummary() {
    let element = this.get('queryBuilderElement');
    let sql = this.$(element).queryBuilder('getSQL', false);
    return sql.sql;
  },

  reset() {
    this.setProperties({
      isListening: false,
      listenDuration: 0,
      hasError: false,
      hasSaved: false
    });
    this.$(this.get('queryBuilderInputs')).removeAttr('disabled');
  },

  validate() {
    this.reset();
    let query = this.get('query');
    return this.get('queryManager').cleanup(query).then(() => {
      return query.validate().then(hash => {
        let isValid = this.isCurrentFilterValid() && hash.validations.get('isValid');
        return isValid ? resolve() : reject();
      });
    });
  },

  save() {
    return this.validate().then(() => {
      return this.get('queryManager').save(this.get('query'), this.currentFilterClause(), this.currentFilterSummary());
    }, () => {
      this.set('hasError', true);
      this.get('scroller').scrollVertical('.validation-container');
      return reject();
    });
  },

  actions: {
    save() {
      this.save().then(() => {
        this.set('hasSaved', true);
        this.get('scroller').scrollVertical('.validation-container');
      });
    },

    listen() {
      this.save().then(() => {
        this.setProperties({
          isListening: true,
          hasSaved: true,
          listenDuration: this.get('query.duration') * 1000
        });
        this.$(this.get('queryBuilderInputs')).attr('disabled', true);
        this.sendAction('fireQuery');
      });
    }
  }
});
