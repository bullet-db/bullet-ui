/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { resolve, reject } from 'rsvp';
import $ from 'jquery';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action, computed, get } from '@ember/object';
import { isEqual } from '@ember/utils';
import { EMPTY_CLAUSE } from 'bullet-ui/utils/filterizer';
import { SUBFIELD_SEPARATOR } from 'bullet-ui/models/column';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';
import BuilderAdapter from 'bullet-ui/utils/builder-adapter';

export default class QueryInputComponent extends Component {
  queryBuilderClass = 'builder';
  subfieldSeparator = SUBFIELD_SEPARATOR;
  subfieldSuffix = `${SUBFIELD_SEPARATOR}*`;

  @service queryManager;
  @tracked query;
  @tracked builderAdapter;
  @tracked isListening = false;
  @tracked hasError = false;
  @tracked hasSaved = false;
  // scroller: service(),

  constructor() {
    super(...arguments);
    this.query = this.args.query;
    this.builderAdapter = new BuilderAdapter(this.subfieldSuffix, this.subfieldSeparator);
  }

  get queryBuilderElement() {
    return `.${this.queryBuilderClass}`;
  }

  get queryBuilderInputs() {
    let element = this.queryBuilderElement;
    return `${element} input, ${element} select, ${element} button`;
  }

  get isCurrentFilterValid() {
    let element = this.queryBuilderElement;
    return $(element).queryBuilder('validate');
  }

  get currentFilterClause() {
    let element = this.queryBuilderElement;
    return $(element).queryBuilder('getRules');
  }

  get currentFilterSummary() {
    let element = this.queryBuilderElement;
    let sql = $(element).queryBuilder('getSQL', false);
    return sql.sql;
  }

  @computed('args.schema')
  get columns() {
    let schema = this.args.schema;
    return this.builderAdapter.builderFilters(schema);
  }

  @computed('query.{aggregation.type,isWindowless}')
  get showAggregationSize() {
    let query = this.query;
    return isEqual(get(query, 'aggregation.type'), AGGREGATIONS.get('RAW')) && query.isWindowless;
  }

  @computed('query.filter.clause')
  get filterClause() {
    let rules = get(this.query, 'filter.clause');
    if (rules && !$.isEmptyObject(rules)) {
      return rules;
    }
    return EMPTY_CLAUSE;
  }

  get queryBuilderOptions() {
    let options = this.builderAdapter.builderOptions();
    options.filters = this.columns;
    options.rules = this.filterClause;
    return options;
  }

  // Render modifier on did-insert for adding the QueryBuilder
  addQueryBuilder(element, [options]) {
    $(element).queryBuilder(options);
  }

  reset() {
    this.isListening = false;
    this.hasError = false;
    this.hasSaved = false;
    $(this.queryBuilderInputs).removeAttr('disabled');
  }

  validate() {
    this.reset();
    let query = this.query;
    return this.queryManager.cleanup(query).then(() => {
      return query.validate().then(hash => {
        let isValid = this.isCurrentFilterValid && hash.validations.get('isValid');
        return isValid ? resolve() : reject();
      });
    });
  }

  doSave() {
    return this.validate().then(() => {
      return this.queryManager.save(this.query, this.currentFilterClause, this.currentFilterSummary);
    }, () => {
      this.hasError = true;
      // this.scroller.scrollVertical('.validation-container');
      return reject();
    });
  }

  @action
  save() {
    this.doSave().then(() => {
      this.hasSaved = true;
      // this.scroller.scrollVertical('.validation-container');
    });
  }

  @action
  listen() {
    this.doSave().then(() => {
      this.isListening = true;
      this.hasSaved = true;
      $(this.queryBuilderInputs).attr('disabled', true);
      this.args.fireQuery();
    });
  }
}
