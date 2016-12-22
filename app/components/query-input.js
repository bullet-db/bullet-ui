/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import { SUBFIELD_SEPARATOR } from 'bullet-ui/models/column';
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
  // TODO: Get store out of component
  store: Ember.inject.service(),
  scroller: Ember.inject.service(),
  schema: null,
  isListening: false,
  listenDuration: 0,
  hasError: false,
  hasSaved: false,
  hasCancelled: false,
  // Merging of the one aggregation and projections till new types of aggregations are added.
  PROJECTION_TYPES: Ember.Object.create({ ALL: 0, COUNT: 1, SELECT: 2 }),

  projectionType: Ember.computed('query.projections', 'query.aggregation.type', function() {
    let projections = this.get('query.projections');
    let aggregation = this.get('query.aggregation.type');
    const ALL = this.get('PROJECTION_TYPES.ALL');
    const SELECT = this.get('PROJECTION_TYPES.SELECT');
    const COUNT = this.get('PROJECTION_TYPES.COUNT');
    if (aggregation === 'COUNT') {
      return COUNT;
    }
    return Ember.isEmpty(projections) ? ALL : SELECT;
  }),

  showProjectionSelection: Ember.computed('projectionType', function() {
    return this.get('projectionType') === this.get('PROJECTION_TYPES.SELECT');
  }),

  columns: Ember.computed('schema', function() {
    let schema = this.get('schema');
    return this.builderFilters(schema);
  }).readOnly(),

  init() {
    this._super(...arguments);
  },

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

  fixProjections(query) {
    return query.get('projections').then((p) => {
      p.forEach(i => {
        if (Ember.isBlank(i.get('name'))) {
          i.set('name', i.get('field'));
        }
      });
    });
  },

  validate() {
    this.reset();
    let query = this.get('query');
    let isFilterValid = this.isCurrentFilterValid();
    return this.fixProjections(query).then(() => {
      return query.validate().then((hash) => {
        let isValid = isFilterValid && hash.validations.get('isValid');
        return isValid ? Ember.RSVP.resolve() : Ember.RSVP.reject();
      });
    });
  },

  save() {
    let clause = this.currentFilterClause();
    let summary = this.currentFilterSummary();
    let promises = [
      this.get('query.filter').then(i => {
        i.set('clause', clause);
        i.set('summary', summary);
        i.save();
      }),
      this.get('query.projections').forEach(i => i.save()),
      this.get('query.aggregation').then(i => {
        let type = this.get('projectionType');
        const COUNT = this.get('PROJECTION_TYPES.COUNT');
        i.set('type', type === COUNT ? AGGREGATIONS.get('COUNT') : AGGREGATIONS.get('LIMIT'));
        i.save();
      }),
      this.get('query').save()
    ];
    return Ember.RSVP.all(promises);
  },

  validateAndSave() {
    return this.validate().then(result => {
      return this.save();
    }, (args) => {
      this.set('hasError', true);
      this.get('scroller').scrollVertical('.validation-container');
      return Ember.RSVP.reject();
    });
  },

  actions: {
    removeProjections() {
      this.get('query.projections').then((p) => {
        p.forEach(i => {
          i.destroyRecord();
        });
      });
    },

    addProjectionToQuery() {
      // Autosave takes care of updating query
      let query = this.get('query');
      let projection = this.get('store').createRecord('projection', {
        query: query
      });
      projection.save().then(() => {
        this.get('scroller').scrollVertical('.options-container', { duration: 0 });
      });
    },

    modifyProjection(projection, field) {
      projection.set('field', field);
      projection.set('name', '');
      projection.save();
    },

    removeProjectionFromQuery(projection) {
      // Autosave takes care of updating query
      projection.destroyRecord();
    },

    save() {
      this.validateAndSave().then(() => {
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
      this.validateAndSave().then(() => {
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
