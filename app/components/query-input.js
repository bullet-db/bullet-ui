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
  // The args filter
  filter;
  // Keep track of the args window array to add a new window to it if the query did not have one to begin with
  window;
  // Unchanging changesets. No need to track.
  queryChangeset;
  aggregationChangeset;

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
    this.filter = this.args.filter;
    // Create all changesets
    this.queryChangeset = this.args.query;

    this.projections = this.args.projections;
    this.rawType = isEmpty(this.projections) ? RAWS.get('ALL') : RAWS.get('SELECT');

    this.outputDataType = this.args.aggregation.get('type') || AGGREGATIONS.get('RAW');
    this.distributionType = this.args.aggregation.get('attributes.type') || DISTRIBUTIONS.get('QUANTILE');
    this.pointType = this.args.aggregation.get('attributes.pointType') || DISTRIBUTION_POINTS.get('NUMBER');
    this.aggregationChangeset = this.args.aggregation;

    this.groups = this.args.groups;
    this.metrics = this.args.metrics;

    this.window = this.args.window;
    this.hasWindow = !isEmpty(this.window);
    if (this.hasWindow) {
      this.windowChangeset = this.window.objectAt(0);
      this.emitType = this.windowChangeset.get('emitType');
      this.includeType = this.windowChangeset.get('includeType');
    }
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
    let rules = this.filter.get('clause');
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
    for (let i = 0; i < fields.length; i++) {
      delete attributes[fields[i]];
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

  changeAggregationToProjection(type) {
    return this.changeAggregationToFieldLike(type, 'projection', this.projections);
  }

  changeAggregationToGroup(type) {
    return this.changeAggregationToFieldLike(type, 'group', this.groups);
  }

  createWindow() {
    return this.queryManager.createModel('window').then(window => {
      this.windowChangeset = this.queryManager.createChangeset(window, 'window');
      this.window.pushObject(this.windowChangeset);
      return resolve(this.windowChangeset);
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

  validateChangeset(changeset) {
    return changeset.validate().then(() => {
      return resolve(A(changeset.get('isInvalid') ? changeset.errors : []));
    });
  }

  collectValidations(promises, accumulator = A()) {
    return promises.then((results) => {
      results.forEach((result) => {
        accumulator.pushObjects(result);
      });
      return resolve(accumulator);
    });
  }

  validateCollection(collection, onErrorMessage) {
    let validations = collection.map(item => this.validateChangeset(item));
    return this.collectValidations(all(validations)).then(result => {
      return resolve(A(isEmpty(result) ? [] : [onErrorMessage]));
    });
  }

  reset() {
    this.isListening = false;
    this.hasError = false;
    this.hasSaved = false;
    this.errors.clear();
    $(this.queryBuilderInputs).removeAttr('disabled');
  }

  validate() {
    this.reset();
    this.queryManager.cleanup(this.aggregationChangeset, this.projections, this.groups);
    let changesetValidations = [
      this.validateChangeset(this.queryChangeset),
      this.validateChangeset(this.aggregationChangeset),
      this.hasWindow ? this.validateChangeset(this.windowChangeset) : resolve(A()),
      this.validateCollection(this.projections, 'There is an issue with Raw projected fields'),
      this.validateCollection(this.groups, 'There is an issue with aggregation fields'),
      this.validateCollection(this.metrics, 'There is an issue with metrics')
    ];
    return this.collectValidations(all(changesetValidations), this.errors).then((errors) => {
      return isEmpty(errors) ? resolve() : reject();
    });
  }

  doSave() {
    return this.validate().then(() => {
      return this.queryManager.save(this.query, this.queryChangeset, this.aggregationChangeset,
                                    this.projections, this.groups, this.metrics,
                                    this.currentFilterClause, this.currentFilterSummary);
    }, () => {
      this.hasError = true;
      return reject();
    });
  }

  // Actions

  @action
  addRawAggregation(selectType = false) {
    if (selectType) {
      this.changeAggregationToProjection(AGGREGATIONS.get('RAW'), 'projection', this.projections);
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
    this.changeAggregationToGroup(AGGREGATIONS.get('COUNT_DISTINCT'));
  }

  @action
  addTopKAggregation() {
    this.changeAggregationToGroup(AGGREGATIONS.get('TOP_K'));
  }

  @action
  addDistributionAggregation() {
    this.changeAggregationToGroup(AGGREGATIONS.get('DISTRIBUTION')).then(() => {
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
    this.args.forceDirty();
  }

  @action
  addFieldLike(modelName, collection) {
    this.queryManager.createModel(modelName).then((model) => {
      collection.pushObject(this.queryManager.createChangeset(model, modelName));
      this.args.forceDirty();
    });
  }

  @action
  deleteFieldLike(item, collection) {
    collection.removeObject(item);
    this.queryManager.deleteModel(item.get('data'));
    this.args.forceDirty();
  }

  @action
  changeMetricType(metric, value) {
    metric.set('type', value.get('name'));
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
    this.createWindow().then(() => {
      this.includeType = INCLUDE_TYPES.get('WINDOW');
      this.emitType = EMIT_TYPES.get('TIME');
      this.changeWindow(this.emitType, this.defaultEveryForTimeWindow, this.includeType);
      this.hasWindow = true;
      this.args.forceDirty();
    });
  }

  @action
  deleteWindow() {
    this.hasWindow = false;
    this.windowChangeset = null;
    this.queryManager.deleteMultipleCollection(this.window, 'query');
    this.args.forceDirty();
  }

  @action
  save() {
    console.log(this);
    return;
    this.doSave().then(() => {
      this.hasSaved = true;
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
