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
import { EMPTY_CLAUSE } from 'bullet-ui/utils/filterizer';
import { SUBFIELD_SEPARATOR } from 'bullet-ui/models/column';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import BuilderAdapter from 'bullet-ui/utils/builder-adapter';

export default Component.extend({
  queryBuilderClass: 'builder',
  queryBuilderElement: computed('queryBuilderClass', function() {
    return `.${this.queryBuilderClass}`;
  }),
  queryBuilderInputs: computed('queryBuilderElement', function() {
    let element = this.queryBuilderElement;
    return `${element} input, ${element} select, ${element} button`;
  }),
  subfieldSeparator: SUBFIELD_SEPARATOR,
  subfieldSuffix: `${SUBFIELD_SEPARATOR}*`,
  queryManager: service(),
  // scroller: service(),
  query: null,
  schema: null,
  builderAdapter: null,
  isListening: false,
  hasError: false,
  hasSaved: false,

  columns: computed('schema', function() {
    let schema = this.schema;
    return this.get('builderAdapter').builderFilters(schema);
  }).readOnly(),

  showAggregationSize: computed('query.{aggregation.type,isWindowless}', function() {
    return isEqual(this.get('query.aggregation.type'), AGGREGATIONS.get('RAW')) && this.get('query.isWindowless');
  }),

  init() {
    this._super(...arguments);
    this.set('builderAdapter', new BuilderAdapter(this.get('subfieldSuffix'), this.get('subfieldSeparator')));
  },

  addQueryBuilder(element, [builderAdapter, columns, rules]) {
    let options = builderAdapter.builderOptions;
    options.filters = columns;
    console.log(options);

    $(element).queryBuilder(options);

    if (rules && !$.isEmptyObject(rules)) {
      $(element).queryBuilder('setRules', rules);
    } else {
      $(element).queryBuilder('setRules', EMPTY_CLAUSE);
    }
  },

  isCurrentFilterValid() {
    let element = this.queryBuilderElement;
    return $(element).queryBuilder('validate');
  },

  currentFilterClause() {
    let element = this.queryBuilderElement;
    return $(element).queryBuilder('getRules');
  },

  currentFilterSummary() {
    let element = this.queryBuilderElement;
    let sql = this.$(element).queryBuilder('getSQL', false);
    return sql.sql;
  },

  reset() {
    this.setProperties({
      isListening: false,
      hasError: false,
      hasSaved: false
    });
    $(this.queryBuilderInputs).removeAttr('disabled');
  },

  validate() {
    this.reset();
    let query = this.query;
    return this.queryManager.cleanup(query).then(() => {
      return query.validate().then(hash => {
        let isValid = this.isCurrentFilterValid() && hash.validations.get('isValid');
        return isValid ? resolve() : reject();
      });
    });
  },

  save() {
    return this.validate().then(() => {
      return this.queryManager.save(this.query, this.currentFilterClause(), this.currentFilterSummary());
    }, () => {
      this.set('hasError', true);
      // this.scroller.scrollVertical('.validation-container');
      return reject();
    });
  },

  actions: {
    save() {
      this.save().then(() => {
        this.set('hasSaved', true);
        // this.scroller.scrollVertical('.validation-container');
      });
    },

    listen() {
      this.save().then(() => {
        this.setProperties({
          isListening: true,
          hasSaved: true
        });
        $(this.queryBuilderInputs).attr('disabled', true);
        this.sendAction('fireQuery');
      });
    }
  }
});
