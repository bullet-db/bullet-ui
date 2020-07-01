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
import { isEqual, isEmpty } from '@ember/utils';
import { EMPTY_CLAUSE } from 'bullet-ui/utils/filterizer';
import { SUBFIELD_SEPARATOR } from 'bullet-ui/models/column';
import { AGGREGATIONS, RAWS, DISTRIBUTIONS, DISTRIBUTION_POINTS } from 'bullet-ui/models/aggregation';
import { METRICS } from 'bullet-ui/models/metric';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/models/window';
import BuilderAdapter from 'bullet-ui/utils/builder-adapter';
// Validations
import QueryValidations from 'bullet-ui/validators/query';
import ProjectionValidations from 'bullet-ui/validators/projection';
import AggregationValidations from 'bullet-ui/validators/aggregation';
import GroupValidations from 'bullet-ui/validators/group';
import MetricValidations from 'bullet-ui/validators/metric';
import WindowValidations from 'bullet-ui/validators/window';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';

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

  builderAdapter;
  settings;
  query;

  queryChangeset;
  aggregationChangeset;
  windowChangeset;

  @tracked projections;
  @tracked groups;
  @tracked metrics;

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
    this.builderAdapter = new BuilderAdapter(this.subfieldSuffix, this.subfieldSeparator);
    this.query = this.args.query;

    this.outputDataType = this.query.get('aggregation.type') || AGGREGATIONS.get('RAW');
    this.rawType = isEmpty(this.query.get('projections')) ? RAWS.get('ALL') : RAWS.get('SELECT');
    this.distributionType = this.query.get('aggregation.attributes.type') || DISTRIBUTIONS.get('QUANTILE');
    this.pointType = this.query.get('aggregation.attributes.pointType') || DISTRIBUTION_POINTS.get('NUMBER');
    this.emitType = this.query.get('window.emitType');
    this.includeType = this.query.get('window.includeType');

    this.hasWindow = !isEmpty(this.query.get('window.id'));
    this.errors = A();

    this.createQueryChangeset(this.query);
    this.createAggregationChangeset(this.query.get('aggregation'));
    if (this.hasWindow) {
      this.createWindowChangeset(this.query.get('window'));
    }
    this.projections = this.createFieldLikeChangesets(this.query.get('projections'), ProjectionValidations);
    this.groups = this.createFieldLikeChangesets(this.query.get('aggregation.groups'), GroupValidations);
    this.metrics = this.createFieldLikeChangesets(this.query.get('aggregation.metrics'), MetricValidations);
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
    let rules = this.query.get('filter.clause');
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

  // Render modifier on did-insert for scrolling into the validation container
  scrollIntoView(element) {
    element.scrollIntoView(false);
  }

  // Helpers

  createQueryChangeset(queryModel) {
    this.queryChangeset = new Changeset(queryModel, lookupValidator(QueryValidations), QueryValidations);
  }

  createAggregationChangeset(aggregationModel) {
    this.aggregationChangeset = new Changeset(aggregationModel, lookupValidator(AggregationValidations), AggregationValidations);
  }

  createWindowChangeset(windowModel) {
    this.windowChangeset = new Changeset(windowModel, lookupValidator(WindowValidations), WindowValidations);
  }

  createFieldLikeChangesets(collection, validations) {
    let result = A();
    collection.reduce((accumulator, model) => {
      accumulator.pushObject(this.createFieldLikeChangeset(model, validations))
      return accumulator;
    }, result);
    return result;
  }

  createFieldLikeChangeset(model, validations) {
    return new Changeset(model, lookupValidator(validations), validations);
  }

  getValidationsForFieldLike(modelName) {
    switch (modelName) {
      case 'projection':
        return ProjectionValidations;
      case 'group':
        return GroupValidations;
      case 'metric':
        return MetricValidations;
    }
  }

  replaceAggregation(type) {
    if (!isEqual(type, AGGREGATIONS.get('RAW'))) {
      this.rawType = RAWS.get('ALL');
    }
    if (!isEqual(type, AGGREGATIONS.get('DISTRIBUTION'))) {
      this.distributionType = DISTRIBUTIONS.get('QUANTILE');
      this.distributionPointType = DISTRIBUTION_POINTS.get('NUMBER');
    }
    // Reset the aggregation changeset and wipe projections, groups and metrics
    this.queryManager.resetAggregation(this.aggregationChangeset, type);
    let promises = [
      this.queryManager.deleteMultipleCollection(this.projections, 'query'),
      this.queryManager.deleteMultipleCollection(this.groups, 'aggregation'),
      this.queryManager.deleteMultipleCollection(this.metrics, 'aggregation'),
    ];
    return all(promises);
  }

  replaceAggregationWithFieldLike(type, modelName, collection) {
    return this.replaceAggregation(type).then(() => {
      return this.queryManager.createModel(modelName);
    }).then((model) => {
      collection.pushObject(this.createFieldLikeChangeset(model, this.getValidationsForFieldLike(modelName)));
      return resolve();
    });
  }

  replaceAggregationWithProjection(type) {
    return this.replaceAggregationWithFieldLike(type, 'projection', this.projections);
  }

  replaceAggregationWithGroup(type) {
    return this.replaceAggregationWithFieldLike(type, 'group', this.groups);
  }

  replaceWindow(emitType, emitEvery, includeType) {
    this.windowChangeset.set('emitType', emitType);
    this.windowChangeset.set('emitEvery', emitEvery);
    this.windowChangeset.set('includeType', includeType);
  }

  setAttributes(type, pointType) {
    let defaults = { points: '', start: '', end: '', increment: '', numberOfPoints: '' };
    if (isEqual(type, DISTRIBUTIONS.get('QUANTILE'))) {
      defaults.points = get(this.settings, 'defaultValues.distributionQuantilePoints');
      defaults.start = get(this.settings, 'defaultValues.distributionQuantileStart');
      defaults.end = get(this.settings, 'defaultValues.distributionQuantileEnd');
      defaults.increment = get(this.settings, 'defaultValues.distributionQuantileIncrement');
    }
    defaults.numberOfPoints = get(this.settings, 'defaultValues.distributionNumberOfPoints');

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
    this.errors.clear();
    $(this.queryBuilderInputs).removeAttr('disabled');
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
      this.replaceAggregationWithProjection(AGGREGATIONS.get('RAW'), 'projection', this.projections);
    } else {
      this.replaceAggregation(AGGREGATIONS.get('RAW'));
    }
  }

  @action
  addGroupAggregation() {
    this.replaceAggregation(AGGREGATIONS.get('GROUP'));
  }

  @action
  addCountDistinctAggregation() {
    this.replaceAggregationWithGroup(AGGREGATIONS.get('COUNT_DISTINCT'));
  }

  @action
  addTopKAggregation() {
    this.replaceAggregationWithGroup(AGGREGATIONS.get('TOP_K'));
  }

  @action
  addDistributionAggregation() {
    this.replaceAggregationWithGroup(AGGREGATIONS.get('DISTRIBUTION')).then(() => {
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
  }

  @action
  addFieldLikeChangeset(modelName, collection) {
    this.queryManager.createModel(modelName).then((model) => {
      collection.pushObject(this.createFieldLikeChangeset(model, this.getValidationsForFieldLike(modelName)));
    });
  }

  @action
  deleteFieldLikeChangeset(item, collection) {
    collection.removeObject(item);
    this.queryManager.deleteModel(item.get('data'));
  }

  @action
  disableMetricField(changeset) {
    return changeset.get('type') !== 'Count';
  }

  @action
  changeMetricType(metric, value) {
    metric.set('type', value.get('name'));
  }

  @action
  changeEmitType(emitType) {
    if (isEqual(emitType, EMIT_TYPES.get('RECORD'))) {
      this.includeType = INCLUDE_TYPES.get('WINDOW');
      this.replaceWindow(emitType, this.defaultEveryForRecordWindow, INCLUDE_TYPES.get('WINDOW'));
    } else {
      this.replaceWindow(emitType, this.defaultEveryForTimeWindow, this.includeType);
    }
  }

  @action
  changeIncludeType(includeType) {
    this.replaceWindow(this.emitType, this.windowChangeset.get('emitEvery'), includeType);
  }

  @action
  addWindow() {
    this.includeType = INCLUDE_TYPES.get('WINDOW');
    this.changeEmitType(EMIT_TYPES.get('TIME'));
    this.hasWindow = true;
  }

  @action
  deleteWindow() {
    this.hasWindow = false;
  }

  @action
  save() {
    console.log(this);
    console.log(this.settings);
    console.log(this.queryChangeset.get('changes'));
    console.log(this.aggregationChangeset.get('changes'));
    console.log(this.windowChangeset.get('changes'));
    // this.doSave().then(() => {
    //   this.hasSaved = true;
    // });
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
