/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { all, resolve, reject } from 'rsvp';
import $ from 'jquery';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import EmberObject, { action, computed, get } from '@ember/object';
import { alias, and, equal, or, not } from '@ember/object/computed';
import { isEqual, isEmpty, isNone } from '@ember/utils';
import { EMPTY_CLAUSE } from 'bullet-ui/utils/filterizer';
import { SUBFIELD_SEPARATOR } from 'bullet-ui/models/column';
import { AGGREGATIONS, RAWS, DISTRIBUTIONS, DISTRIBUTION_POINTS } from 'bullet-ui/models/aggregation';
import { METRICS } from 'bullet-ui/models/metric';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';
import BuilderAdapter from 'bullet-ui/utils/builder-adapter';

export default class QueryInputComponent extends Component {
  // Constants
  queryBuilderClass = 'builder';
  subfieldSeparator = SUBFIELD_SEPARATOR;
  subfieldSuffix = `${SUBFIELD_SEPARATOR}*`;
  AGGREGATION_TYPES = AGGREGATIONS.get('NAMES');
  RAW_TYPES = RAWS.get('NAMES');
  DISTRIBUTION_TYPES = DISTRIBUTIONS.get('NAMES');
  DISTRIBUTION_POINT_TYPES = DISTRIBUTION_POINTS.get('NAMES');
  EMIT_TYPES = EMIT_TYPES.get('NAMES');
  INCLUDE_TYPES = INCLUDE_TYPES.get('NAMES');
  METRIC_TYPES = METRICS.get('NAMES');
  METRICS_LIST = METRICS.asList();

  @service queryManager;

  // Settings are not auto-injected. Need to save it from factory lookup
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
  @equal('outputDataType', AGGREGATIONS.get('RAW')) isRawAggregation;
  @equal('outputDataType', AGGREGATIONS.get('GROUP')) isGroupAggregation;
  @equal('outputDataType', AGGREGATIONS.get('COUNT_DISTINCT')) isCountDistinctAggregation;
  @equal('outputDataType', AGGREGATIONS.get('DISTRIBUTION')) isDistributionAggregation;
  @equal('outputDataType', AGGREGATIONS.get('TOP_K')) isTopKAggregation;
  @equal('rawType', RAWS.get('SELECT')) isSelectType;
  @and('isRawAggregation', 'isSelectType') showRawSelections;
  @equal('pointType', DISTRIBUTION_POINTS.get('NUMBER')) isNumberOfPoints;
  @equal('pointType', DISTRIBUTION_POINTS.get('POINTS')) isPoints;
  @equal('pointType', DISTRIBUTION_POINTS.get('GENERATED')) isGeneratedPoints;
  @equal('emitType', EMIT_TYPES.get('TIME')) isTimeBasedWindow;
  @equal('emitType', EMIT_TYPES.get('RECORD')) isRecordBasedWindow;
  @or('isRecordBasedWindow', 'isListening') everyDisabled;
  @or('isRecordBasedWindow', 'isListening') includeDisabled;
  @not('hasWindow') noWindow;
  @alias('settings.defaultValues.everyForRecordBasedWindow') defaultEveryForRecordWindow;
  @alias('settings.defaultValues.everyForTimeBasedWindow') defaultEveryForTimeWindow;

  constructor() {
    super(...arguments);
    this.settings = getOwner(this).lookup('settings:main');
    this.errors = A();

    this.builderAdapter = new BuilderAdapter(this.subfieldSuffix, this.subfieldSeparator);

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

    this.rawType = isEmpty(this.projections) ? RAWS.get('ALL') : RAWS.get('SELECT');
    this.outputDataType = this.aggregationChangeset.get('type') || AGGREGATIONS.get('RAW');
    this.distributionType = this.aggregationChangeset.get('attributes.type') || DISTRIBUTIONS.get('QUANTILE');
    this.pointType = this.aggregationChangeset.get('attributes.pointType') || DISTRIBUTION_POINTS.get('NUMBER');
  }

  // Getters

  // This is computed since it shouldn't change and we want to cache it for large schemas
  @computed('args.schema')
  get columns() {
    return this.builderAdapter.builderFilters(this.args.schema);
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

  // Render Modifiers and Modifier Helpers

  get filterClause() {
    let rules = this.filterChangeset && this.filterChangeset.get('clause');
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
  addQueryBuilder(element, [options, onChange]) {
    $(element).queryBuilder(options);
    $(element).on('rulesChanged.queryBuilder', () => {
      onChange();
    });
  }

  // Render modifier on did-insert for scrolling into the validation container
  scrollIntoView(element) {
    element.scrollIntoView(false);
  }

  // Helpers
  async createOptionalModel(modelName, collection) {
    let model = await this.queryManager.createModel(modelName);
    let changeset = this.queryManager.createChangeset(model, modelName);
    collection.pushObject(changeset);
    return changeset;
  }

  async setFilter() {
    if (isNone(this.filterChangeset)) {
      this.filterChangeset = await this.createOptionalModel('filter', this.filter);
    }
    // This check is here because the changeset creates a wrapper for the object literal clause and that counts as a
    // change. Since we have an action for forcing dirty on a filter change, we can track this on a real change instead
    // and use it to set the clause only if something really changed.
    if (this.filterChanged) {
      this.filterChangeset.set('clause', this.currentFilterClause);
    }
    // Summary might change even without the clause changing because we create it from the query builder's toSQL
    let originalSummary = this.filterChangeset.get('summary');
    let currentFilterSummary = this.currentFilterSummary;
    if (!isEqual(originalSummary, currentFilterSummary)) {
      this.filterChangeset.set('summary', this.currentFilterSummary);
    }
    return this.filterChangeset;
  }

  changeAggregation(type) {
    if (!isEqual(type, AGGREGATIONS.get('RAW'))) {
      this.rawType = RAWS.get('ALL');
    }
    if (!isEqual(type, AGGREGATIONS.get('DISTRIBUTION'))) {
      this.distributionType = DISTRIBUTIONS.get('QUANTILE');
      this.distributionPointType = DISTRIBUTION_POINTS.get('NUMBER');
    }

    // Reset the aggregation changeset
    this.aggregationChangeset.set('type', type);
    this.aggregationChangeset.set('size', 1);
    let attributes = this.aggregationChangeset.get('attributes');
    let fields = Object.getOwnPropertyNames(attributes);
    for (const field of fields) {
      delete attributes[field];
    }
    // Wipe projections, groups and metrics
    let promises = [
      this.queryManager.deleteMultipleCollection(this.projections, 'query'),
      this.queryManager.deleteMultipleCollection(this.groups, 'aggregation'),
      this.queryManager.deleteMultipleCollection(this.metrics, 'aggregation'),
    ];
    return all(promises);
  }

  changeAggregationToFieldLike(type, modelName, collection) {
    return this.changeAggregation(type).then(() => {
      return this.queryManager.createModel(modelName);
    }).then((model) => {
      collection.pushObject(this.queryManager.createChangeset(model, modelName));
      return resolve();
    });
  }

  changeWindow(emitType, emitEvery, includeType) {
    this.windowChangeset.set('emitType', emitType);
    this.windowChangeset.set('emitEvery', emitEvery);
    this.windowChangeset.set('includeType', includeType);
  }

  setAttributes(type, pointType) {
    let defaults = { points: '', start: '', end: '', increment: '', numberOfPoints: '' };
    if (isEqual(type, DISTRIBUTIONS.get('QUANTILE'))) {
      defaults.points = this.settings.get('defaultValues.distributionQuantilePoints');
      defaults.start = this.settings.get('defaultValues.distributionQuantileStart');
      defaults.end = this.settings.get('defaultValues.distributionQuantileEnd');
      defaults.increment = this.settings.get('defaultValues.distributionQuantileIncrement');
    }
    defaults.numberOfPoints = this.settings.get('defaultValues.distributionNumberOfPoints');

    let lastQuantile = isEqual(this.aggregationChangeset.get('attributes.type'), DISTRIBUTIONS.get('QUANTILE'));
    let isQuantile = isEqual(type, DISTRIBUTIONS.get('QUANTILE'));
    let fields = [];
    for (let field in defaults) {
      // Wipe the current values if our last type or current type is Quantile but not both -> an XOR operation
      // If you're changing point types within particular distribution type, it shouldn't lose values entered
      // But if you go to QUANTILE or come from QUANTILE, it will wipe all the quantile specific defaults
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
    this.hasError = false;
    this.hasSaved = false;
    this.filterChanged = false;
    this.errors.clear();
    $(this.queryBuilderInputs).removeAttr('disabled');
  }

  async validate() {
    this.reset();
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
    if (!this.isCurrentFilterValid) {
      validations.push(this.queryManager.createValidationError('There is an issue with the filters'));
    }
    if (!isEmpty(validations)) {
      throw validations;
    }
  }

  async doSave() {
    await this.setFilter();
    try {
      await this.validate();
      await this.args.onSaveQuery();
      this.hasSaved = true;
    } catch(errors) {
      this.hasError = true;
      this.errors = A(errors);
      throw error;
    }
  }

  // Actions

  @action
  changeFilter() {
    this.filterChanged = true;
    this.args.onDirty();
  }

  @action
  addRawAggregation(selectType = false) {
    if (selectType) {
      this.changeAggregationToFieldLike(AGGREGATIONS.get('RAW'), 'projection', this.projections);
    } else {
      this.changeAggregation(AGGREGATIONS.get('RAW'));
    }
  }

  @action
  addGroupAggregation() {
    this.changeAggregation(AGGREGATIONS.get('GROUP'));
  }

  @action
  addCountDistinctAggregation() {
    this.changeAggregationToFieldLike(AGGREGATIONS.get('COUNT_DISTINCT'), 'group', this.groups);
  }

  @action
  addTopKAggregation() {
    this.changeAggregationToFieldLike(AGGREGATIONS.get('TOP_K'), 'group', this.groups);
  }

  @action
  addDistributionAggregation() {
    this.changeAggregationToFieldLike(AGGREGATIONS.get('DISTRIBUTION'), 'group', this.groups).then(() => {
      // Default type is Quantile, Number of Points
      this.setAttributes(DISTRIBUTIONS.get('QUANTILE'), DISTRIBUTION_POINTS.get('NUMBER'));
    });
  }

  @action
  changeDistributionType(type) {
    this.setAttributes(type, this.pointType);
  }

  @action
  changeDistributionPointType(type) {
    this.setAttributes(this.distributionType, type);
  }

  @action
  deleteProjections() {
    this.queryManager.deleteMultipleCollection(this.projections, 'query');
    this.args.onDirty();
  }

  @action
  addFieldLike(modelName, collection) {
    this.queryManager.createModel(modelName).then((model) => {
      collection.pushObject(this.queryManager.createChangeset(model, modelName));
      this.args.onDirty();
    });
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
    if (isEqual(emitType, EMIT_TYPES.get('RECORD'))) {
      this.includeType = INCLUDE_TYPES.get('WINDOW');
      this.changeWindow(emitType, this.defaultEveryForRecordWindow, INCLUDE_TYPES.get('WINDOW'));
    } else {
      this.changeWindow(emitType, this.defaultEveryForTimeWindow, this.includeType);
    }
    this.emitType = emitType;
  }

  @action
  changeIncludeType(includeType) {
    this.changeWindow(this.emitType, this.windowChangeset.get('emitEvery'), includeType);
    this.includeType = includeType;
  }

  @action
  addWindow() {
    this.createOptionalModel('window', this.window).then(changeset => {
      this.windowChangeset = changeset;
      this.includeType = INCLUDE_TYPES.get('WINDOW');
      this.emitType = EMIT_TYPES.get('TIME');
      this.changeWindow(this.emitType, this.defaultEveryForTimeWindow, this.includeType);
      this.hasWindow = true;
      this.args.onDirty();
    });
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
    } catch(error) { }
  }

  @action
  async listen() {
    try {
      await this.doSave();
      this.isListening = true;
      $(this.queryBuilderInputs).attr('disabled', true);
      this.args.onSubmitQuery();
    } catch(error) { }
  }
}
