/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { SUBFIELD_SEPARATOR } from 'bullet-ui/models/column';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import BuilderAdapter from 'bullet-ui/mixins/builder-adapter';

export default Ember.Component.extend(BuilderAdapter, {
  queryBuilderClass: 'builder',
  queryBuilderElement: Ember.computed('queryBuilderClass', function() {
    return `.${this.get('queryBuilderClass')}`;
  }),
  queryBuilderInputs: Ember.computed('queryBuilderElement', function() {
    let element = this.get('queryBuilderElement');
    return `${element} input, ${element} select, ${element} button`;
  }),
  subfieldSeparator: SUBFIELD_SEPARATOR,
  subfieldSuffix: `${SUBFIELD_SEPARATOR}*`,
  query: null,
  queryManager: Ember.inject.service(),
  scroller: Ember.inject.service(),
  schema: null,
  isListening: false,
  listenDuration: 0,
  hasError: false,
  hasSaved: false,
  hasCancelled: false,

  columns: Ember.computed('schema', function() {
    let schema = this.get('schema');
    return this.builderFilters(schema);
  }).readOnly(),

  showAggregationSize: Ember.computed('query.aggregation.type', function() {
    return this.get('query.aggregation.type') === AGGREGATIONS.get('RAW');
  }),

  didInsertElement() {
    this._super(...arguments);
    let element = this.get('queryBuilderElement');
    let options = this.builderOptions();
    options.filters = this.get('columns');

    this.$(element).queryBuilder(options);

    let rules = this.get('query.filter.clause');
    if (rules && !Ember.$.isEmptyObject(rules)) {
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
      hasSaved: false,
      hasCancelled: false
    });
    this.$(this.get('queryBuilderInputs')).removeAttr('disabled');
  },

  fixFieldLikes(query, fieldLikesPath) {
    return query.get(fieldLikesPath).then((e) => {
      e.forEach(i => {
        if (Ember.isBlank(i.get('name'))) {
          i.set('name', i.get('field'));
        }
      });
      return Ember.RSVP.resolve();
    });
  },

  autoFill(query) {
    return Ember.RSVP.all([
      this.fixFieldLikes(query, 'projections'),
      this.fixFieldLikes(query, 'aggregation.groups')
    ]);
  },

  fixAggregationSize(query) {
    let type = query.get('aggregation.type');
    if (type !== AGGREGATIONS.get('RAW')) {
      query.set('aggregation.size', this.get('settings.defaultValues.aggregationMaxSize'));
    }
  },

  validate() {
    this.reset();
    let query = this.get('query');
    let isFilterValid = this.isCurrentFilterValid();
    return this.autoFill(query).then(() => {
      this.fixAggregationSize(query);
      return query.validate().then((hash) => {
        let isValid = isFilterValid && hash.validations.get('isValid');
        return isValid ? Ember.RSVP.resolve() : Ember.RSVP.reject();
      });
    });
  },

  save() {
    return this.validate().then(() => {
      return this.get('queryManager').save(this.get('query'), this.currentFilterClause(), this.currentFilterSummary());
    }, () => {
      this.set('hasError', true);
      this.get('scroller').scrollVertical('.validation-container');
      return Ember.RSVP.reject();
    });
  },

  actions: {
    save() {
      this.save().then(() => {
        this.set('hasSaved', true);
        this.get('scroller').scrollVertical('.validation-container');
      });
    },

    cancel() {
      this.toggleProperty('isListening');
      this.reset();
      this.set('hasCancelled', true);
      this.get('scroller').scrollVertical('.validation-container');
      this.sendAction('cancelQuery');
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
