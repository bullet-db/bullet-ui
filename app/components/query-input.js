/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import $ from 'jquery';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';
import { alias, and, equal, or, not } from '@ember/object/computed';
import { isEqual, isEmpty, isNone } from '@ember/utils';
import { EMPTY_CLAUSE } from 'bullet-ui/utils/filterizer';
import { builderOptions, builderFilters, addQueryBuilder } from 'bullet-ui/utils/builder-adapter';
import {
  AGGREGATION_TYPES, RAW_TYPES, DISTRIBUTION_TYPES, DISTRIBUTION_POINT_TYPES, METRIC_TYPES, EMIT_TYPES, INCLUDE_TYPES
} from 'bullet-ui/utils/query-constants';

export default class QueryInputComponent extends Component {
  // Constants
  queryBuilderClass = 'builder';
  AGGREGATION_TYPES = AGGREGATION_TYPES;
  RAW_TYPES = RAW_TYPES;
  DISTRIBUTION_TYPES = DISTRIBUTION_TYPES;
  DISTRIBUTION_POINT_TYPES = DISTRIBUTION_POINT_TYPES;
  EMIT_TYPES = EMIT_TYPES;
  INCLUDE_TYPES = INCLUDE_TYPES;
  METRIC_TYPES = METRIC_TYPES;
  METRICS_LIST = METRIC_TYPES.descriptions;

  @service queryManager;

  settings;
  // Keep track of the args window and filter array to add a new one to it if the query did not have one to begin with
  filter;
  window;
  // Unchanging changesets. No need to track.
  filterChangeset;
  queryChangeset;
  aggregationChangeset;

  // A helper variable to not cause unnecessary saves (changeset library uses ObjectTreeNode instead of literal object)
  filterChanged;

  @tracked windowChangeset;
  @tracked projections;
  @tracked groups;
  @tracked metrics;
  // State and errors
  @tracked isListening = false;
  @tracked isValidating = false;
  @tracked hasError = false;
  @tracked errors;
  @tracked hasSaved = false;
  @tracked hasWindow;
  // Radio button properties
  @tracked outputDataType;
  @tracked rawType;
  @tracked distributionType;
  @tracked pointType;
  @tracked emitType;
  @tracked includeType;

  // Helper computed properties
  @equal('outputDataType', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW)) isRawAggregation;
  @equal('outputDataType', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP)) isGroupAggregation;
  @equal('outputDataType', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT)) isCountDistinctAggregation;
  @equal('outputDataType', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION)) isDistributionAggregation;
  @equal('outputDataType', AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K)) isTopKAggregation;
  @equal('rawType', RAW_TYPES.describe(RAW_TYPES.SELECT)) isSelectType;
  @and('isRawAggregation', 'isSelectType') showRawSelections;
  @equal('pointType', DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER)) isNumberOfPoints;
  @equal('pointType', DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.POINTS)) isPoints;
  @equal('pointType', DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.GENERATED)) isGeneratedPoints;
  @equal('emitType', EMIT_TYPES.describe(EMIT_TYPES.TIME)) isTimeBasedWindow;
  @equal('emitType', EMIT_TYPES.describe(EMIT_TYPES.RECORD)) isRecordBasedWindow;
  @or('isRecordBasedWindow', 'isListening') everyDisabled;
  @or('isRecordBasedWindow', 'isListening') includeDisabled;
  @not('hasWindow') noWindow;
  @alias('settings.defaultValues.everyForRecordBasedWindow') defaultEveryForRecordWindow;
  @alias('settings.defaultValues.everyForTimeBasedWindow') defaultEveryForTimeWindow;

  constructor() {
    super(...arguments);
    this.settings = getOwner(this).lookup('settings:main');
    this.errors = A();

    // Save all changesets and changeset arrays
    this.queryChangeset = this.args.query;
    this.aggregationChangeset = this.args.aggregation;
    this.filter = this.args.filter;
    this.window = this.args.window;
    this.projections = this.args.projections;
    this.groups = this.args.groups;
    this.metrics = this.args.metrics;

    this.filterChanged = false;
    let hasFilter = !isEmpty(this.filter);
    if (hasFilter) {
      this.filterChangeset = this.filter.objectAt(0);
    }
    this.hasWindow = !isEmpty(this.window);
    if (this.hasWindow) {
      this.windowChangeset = this.window.objectAt(0);
      this.emitType = this.windowChangeset.get('emitType');
      this.includeType = this.windowChangeset.get('includeType');
    }

    this.rawType = RAW_TYPES.describe(isEmpty(this.projections) ? RAW_TYPES.ALL : RAW_TYPES.SELECT);
    this.outputDataType = this.aggregationChangeset.get('type') || AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW);
    this.distributionType = this.aggregationChangeset.get('attributes.type') || DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE);
    this.pointType = this.aggregationChangeset.get('attributes.pointType') || DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER);
  }

  // Getters

  @computed('args.schema')
  get columns() {
    return builderFilters(this.args.schema);
  }

  get recordBasedWindowDisabled() {
    return this.isListening || !this.isRawAggregation;
  }

  get allIncludeTypeDisabled() {
    return this.includeDisabled || this.isRawAggregation;
  }

  get everyFieldName() {
    return `Frequency (${this.isRecordBasedWindow ? 'records' : 'seconds'})`;
  }

  get canDeleteProjections() {
    return this.projections.get('length') > 1;
  }

  get canDeleteField() {
    return this.groups.get('length') > 1;
  }

  get showAggregationSize() {
    return this.isRawAggregation && !this.hasWindow;
  }

  get queryBuilderElement() {
    return `.${this.queryBuilderClass}`;
  }

  get queryBuilderInputs() {
    let element = this.queryBuilderElement;
    return `${element} input, ${element} select, ${element} button`;
  }

  get queryBuilderOptions() {
    let options = builderOptions();
    options.filters = this.columns;
    return options;
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

  // Helpers

  setQueryBuilderRules() {
    let element = this.queryBuilderElement;
    let rules = this.filterChangeset.get('clause');
    let summary = this.filterChangeset.get('summary');
    if (rules && !$.isEmptyObject(rules)) {
      $(element).queryBuilder('setRules', rules);
    } else if (!isEmpty(summary)) {
      $(element).queryBuilder('setRulesFromSQL', summary);
    } else {
      $(element).queryBuilder('setRules', EMPTY_CLAUSE);
    }
  }

  setFilter() {
    // This check is here because the changeset creates a wrapper for the object literal clause and that counts as a
    // change. Since we have an action for forcing dirty on a filter change, we can track this on a real change instead
    // and use it to set the clause only if something really changed.
    if (this.filterChanged) {
      this.filterChangeset.set('clause', this.currentFilterClause);
    }
    // Summary might change even without the clause changing because we can create it from the query builder's toSQL
    this.summarizeFilter();
  }

  setFilterSummary() {
    let originalSummary = this.filterChangeset.get('summary');
    let currentFilterSummary = this.currentFilterSummary;
    if (!isEqual(originalSummary, currentFilterSummary)) {
      this.filterChangeset.set('summary', currentFilterSummary);
    }
  }

  dirtyFilter() {
    this.filterChanged = true;
    this.args.onDirty();
  }

  validateFilter() {
    let element = this.queryBuilderElement;
    return $(element).queryBuilder('validate');
  }

  async createOptionalModel(modelName, collection) {
    let model = await this.queryManager.createModel(modelName);
    let changeset = this.queryManager.createChangeset(model, modelName);
    collection.pushObject(changeset);
    return changeset;
  }

  async changeAggregation(type) {
    if (!isEqual(type, AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW))) {
      this.rawType = RAW_TYPES.describe(RAW_TYPES.ALL);
    }
    if (!isEqual(type, AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION))) {
      this.distributionType = DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE);
      this.distributionPointType = DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER);
    }

    // Reset the aggregation changeset
    this.aggregationChangeset.set('type', type);
    this.aggregationChangeset.set('size', 1);
    this.queryManager.wipeAggregationAttributes(this.aggregationChangeset);
    // Wipe projections, groups and metrics
    let promises = [
      this.queryManager.deleteMultipleCollection(this.projections, 'query'),
      this.queryManager.deleteMultipleCollection(this.groups, 'aggregation'),
      this.queryManager.deleteMultipleCollection(this.metrics, 'aggregation'),
    ];
    return Promise.all(promises);
  }

  async changeAggregationToFieldLike(type, modelName, collection) {
    await this.changeAggregation(type);
    let model = await this.queryManager.createModel(modelName);
    collection.pushObject(this.queryManager.createChangeset(model, modelName));
  }

  changeWindow(emitType, emitEvery, includeType) {
    this.windowChangeset.set('emitType', emitType);
    this.windowChangeset.set('emitEvery', emitEvery);
    this.windowChangeset.set('includeType', includeType);
  }

  setAttributes(type, pointType) {
    let defaults = { points: '', start: '', end: '', increment: '', numberOfPoints: '' };
    let quantile = DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE);
    if (isEqual(type, quantile)) {
      defaults.points = this.settings.get('defaultValues.distributionQuantilePoints');
      defaults.start = this.settings.get('defaultValues.distributionQuantileStart');
      defaults.end = this.settings.get('defaultValues.distributionQuantileEnd');
      defaults.increment = this.settings.get('defaultValues.distributionQuantileIncrement');
    }
    defaults.numberOfPoints = this.settings.get('defaultValues.distributionNumberOfPoints');

    let lastQuantile = isEqual(this.aggregationChangeset.get('attributes.type'), quantile);
    let isQuantile = isEqual(type, quantile);
    let fields = [];
    for (let field in defaults) {
      // Wipe the current values if our last type or current type is quantile but not both -> an XOR operation
      // If you're changing point types within particular distribution type, it shouldn't lose values entered
      // But if you go to quantile or come from quantile, it will wipe all the quantile specific defaults
      fields.push({ name: field, value: defaults[field], forceSet: lastQuantile !== isQuantile });
    }
    fields.push({ name: 'type', value: type, forceSet: true });
    fields.push({ name: 'pointType', value: pointType, forceSet: true });
    fields.forEach(field => {
      let name = field.name;
      let value = field.value;
      let forceSet = field.forceSet || false;
      let fieldPath = `attributes.${name}`;
      if (forceSet || isEmpty(this.aggregationChangeset.get(fieldPath))) {
        this.aggregationChangeset.set(fieldPath, value);
      }
    });
  }

  reset() {
    this.isListening = false;
    this.isValidating = false;
    this.hasError = false;
    this.hasSaved = false;
    this.filterChanged = false;
    this.errors.clear();
    $(this.queryBuilderInputs).removeAttr('disabled');
  }

  async validate() {
    this.reset();
    this.isValidating = true;
    await this.queryManager.cleanup(this.aggregationChangeset, this.projections, this.groups);
    let changesets = {
      query: this.queryChangeset,
      aggregation: this.aggregationChangeset,
      window: this.windowChangeset,
      projections: this.projections,
      groups: this.groups,
      metrics: this.metrics
    };
    let validations = await this.queryManager.validate(changesets);
    if (!this.validateFilter()) {
      validations.push(this.queryManager.createValidationError('There is an issue with the filters'));
    }
    this.isValidating = false;
    if (!isEmpty(validations)) {
      throw validations;
    }
  }

  async doSave() {
    this.setFilter();
    try {
      await this.validate();
      await this.args.onSaveQuery();
      this.hasSaved = true;
    } catch(errors) {
      this.hasError = true;
      this.errors = A(errors);
      throw errors;
    }
  }

  // Actions

  @action
  async addQueryBuilder(element) {
    if (isNone(this.filterChangeset)) {
      this.filterChangeset = await this.createOptionalModel('filter', this.filter);
    }
    addQueryBuilder($(element), this.queryBuilderOptions, this, this.dirtyFilter, this.validateFilter);
    // Set the initial rules
    this.setQueryBuilderRules();
    // Do this to set the summary for newly created queries with default filters
    this.setFilterSummary();
  }

  @action
  scrollIntoView(element) {
    element.scrollIntoView(false);
  }

  @action
  addRawAggregation(selectType = false) {
    const RAW = AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW);
    if (selectType) {
      this.changeAggregationToFieldLike(RAW, 'projection', this.projections);
    } else {
      this.changeAggregation(RAW);
    }
  }

  @action
  addGroupAggregation() {
    this.changeAggregation(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP));
  }

  @action
  addCountDistinctAggregation() {
    this.changeAggregationToFieldLike(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.COUNT_DISTINCT), 'group', this.groups);
  }

  @action
  addTopKAggregation() {
    this.changeAggregationToFieldLike(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.TOP_K), 'group', this.groups);
  }

  @action
  async addDistributionAggregation() {
    await this.changeAggregationToFieldLike(AGGREGATION_TYPES.describe(AGGREGATION_TYPES.DISTRIBUTION), 'group', this.groups);
    // Default type is Quantile, Number of Points
    this.setAttributes(DISTRIBUTION_TYPES.describe(DISTRIBUTION_TYPES.QUANTILE), DISTRIBUTION_POINT_TYPES.describe(DISTRIBUTION_POINT_TYPES.NUMBER));
  }

  @action
  changeDistributionType(type) {
    this.setAttributes(DISTRIBUTION_TYPES.describe(type), this.pointType);
  }

  @action
  changeDistributionPointType(type) {
    this.setAttributes(this.distributionType, DISTRIBUTION_POINT_TYPES.describe(type));
  }

  @action
  deleteProjections() {
    this.queryManager.deleteMultipleCollection(this.projections, 'query');
    this.args.onDirty();
  }

  @action
  async addFieldLike(modelName, collection) {
    let model = await this.queryManager.createModel(modelName);
    collection.pushObject(this.queryManager.createChangeset(model, modelName));
    this.args.onDirty();
  }

  @action
  deleteFieldLike(item, collection) {
    collection.removeObject(item);
    this.queryManager.deleteModel(item.get('data'));
    this.args.onDirty();
  }

  @action
  changeAttribute(field, value) {
    this.aggregationChangeset.set(`attributes.${field}`, value);
  }

  @action
  changeEmitType(emitType) {
    this.emitType = EMIT_TYPES.describe(emitType);
    if (isEqual(emitType, EMIT_TYPES.RECORD)) {
      this.includeType = INCLUDE_TYPES.describe(INCLUDE_TYPES.WINDOW);
      this.changeWindow(this.emitType, this.defaultEveryForRecordWindow, this.includeType);
    } else {
      this.changeWindow(this.emitType, this.defaultEveryForTimeWindow, this.includeType);
    }
  }

  @action
  changeIncludeType(includeType) {
    this.includeType = INCLUDE_TYPES.describe(includeType);
    this.changeWindow(this.emitType, this.windowChangeset.get('emitEvery'), this.includeType);
  }

  @action
  async addWindow() {
    let changeset = await this.createOptionalModel('window', this.window);
    this.windowChangeset = changeset;
    this.includeType = INCLUDE_TYPES.describe(INCLUDE_TYPES.WINDOW);
    this.emitType = EMIT_TYPES.describe(EMIT_TYPES.TIME);
    this.changeWindow(this.emitType, this.defaultEveryForTimeWindow, this.includeType);
    this.hasWindow = true;
    this.args.onDirty();
  }

  @action
  deleteWindow() {
    this.hasWindow = false;
    this.windowChangeset = null;
    this.queryManager.deleteMultipleCollection(this.window, 'query');
    this.args.onDirty();
  }

  @action
  async save() {
    try {
      await this.doSave();
    } catch(error) {
      // empty
    }
  }

  @action
  async listen() {
    try {
      await this.doSave();
      this.isListening = true;
      $(this.queryBuilderInputs).attr('disabled', true);
      this.args.onSubmitQuery();
    } catch(error) {
      // empty
    }
  }
}
