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
import { alias, and, equal, or } from '@ember/object/computed';
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
  AGGREGATIONS;
  RAWS;
  DISTRIBUTIONS;
  DISTRIBUTION_POINTS;
  EMIT_TYPES;
  INCLUDE_TYPES;
  METRICS_LIST = METRICS.asList(),

  // Export validations for use from template
  ProjectionValidations;
  GroupValidations;
  MetricValidations;
  WindowValidations;

  @service queryManager;

  // Variables
  queryChangeset;
  aggregationChangeset;
  windowChangeset;
  query;
  schema;
  builderAdapter;

  @tracked hasRaw;
  @tracked hasWindow;
  @tracked isListening = false;
  @tracked hasError = false;
  @tracked hasSaved = false;

  // Radio button properties
  @tracked outputDataType;
  @tracked rawType;
  @tracked pointType;
  @tracked distributionType;
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
  @alias('query.isWindowless') isWindowless;
  @equal('emitType', EMIT_TYPES.get('TIME')) isTimeBasedWindow;
  @equal('emitType', EMIT_TYPES.get('RECORD')) isRecordBasedWindow;
  @or('isRecordBasedWindow', 'isListening') everyDisabled;
  @or('isRecordBasedWindow', 'isListening') includeDisabled;

  @alias('settings.defaultValues.everyForRecordBasedWindow') defaultEveryForRecordWindow;
  @alias('settings.defaultValues.everyForTimeBasedWindow') defaultEveryForTimeWindow;

  constructor() {
    super(...arguments);
    this.query = this.args.query;
    this.schema = this.args.schema;
    this.builderAdapter = new BuilderAdapter(this.subfieldSuffix, this.subfieldSeparator);

    // These *Type variables exist because ember-radio-button will set their value locally. Once set,
    // they are independent of the original property. This means they are only used on initial component render.
    this.outputDataType = this.query.get('aggregation.type') || AGGREGATIONS.get('RAW');
    this.rawType = isEmpty(this.query.get('projections')) ? RAWS.get('ALL') : RAWS.get('SELECT');
    this.distributionType = this.query.get('aggregation.attributes.type') || DISTRIBUTIONS.get('QUANTILE');
    this.pointType = this.query.get('aggregation.attributes.pointType') || DISTRIBUTION_POINTS.get('NUMBER');
    this.emitType = this.query.get('window.emitType');
    this.includeType = this.query.get('window.includeType');

    this.hasRaw = isEqual(outputDataType, AGGREGATIONS.get('RAW'));
    this.hasWindow = !isEmpty(this.query.get('window.id'));

    this.queryChangeset = Changeset(this.query, lookupValidator(QueryValidations), QueryValidations);
    this.aggregationChangeset = Changeset(this.query.aggregation, lookupValidator(AggregationValidations), AggregationValidations);
    if (this.hasWindow) {
      this.windowChangeset = Changeset(this.query.window, lookupValidator(WindowValidations), WindowValidations);
    }
  }

  @computed('schema')
  get columns() {
    let schema = this.args.schema;
    return this.builderAdapter.builderFilters(schema);
  }

  @computed('query.projections.[]')
  get canDeleteProjections() {
    return this.query.get('projections.length') > 1;
  }

  @computed('query.aggregation.groups.[]')
  get canDeleteField() {
    return this.query.get('aggregation.groups.length') > 1;
  }

  @computed('isRawAggregation', 'isListening')
  get recordBasedWindowDisabled() {
    return this.isListening || !this.isRawAggregation;
  }

  @computed('isRawAggregation', 'includeDisabled')
  get allIncludeTypeDisabled() {
    return this.includeDisabled || this.isRawAggregation;
  }

  @computed('isRecordBasedWindow')
  get everyFieldName() {}
    return `Frequency (${this.isRecordBasedWindow ? 'records' : 'seconds'})`;
  }

  // Filtering
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

  get showAggregationSize() {
    return this.hasRaw && this.hasWindow;
  }

  @computed('query.filter.clause')
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

  // Render Modifiers

  // Render modifier on did-insert for adding the QueryBuilder
  addQueryBuilder(element, [options]) {
    $(element).queryBuilder(options);
  }

  // Render modifier on did-insert for scrolling into the validation container
  scrollIntoView(element) {
    element.scrollIntoView(false);
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

    let lastQuantile = isEqual(this.query.get('aggregation.attributes.type'), DISTRIBUTIONS.get('QUANTILE'));
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
    this.queryManager.setAggregationAttributes(this.query, fields.map(f => EmberObject.create(f)));
  }

  replaceAggregation(type) {
    if (!isEqual(type, AGGREGATIONS.get('RAW'))) {
      this.rawType = RAWS.get('ALL');
    }
    if (!isEqual(type, AGGREGATIONS.get('DISTRIBUTION'))) {
      this.distributionType = DISTRIBUTIONS.get('QUANTILE');
      this.distributionPointType = DISTRIBUTION_POINTS.get('NUMBER');
    }
    this.queryManager.deleteProjections(this.query);
    return this.queryManager.replaceAggregation(this.query, type);
  }

  replaceAggregationWithField(type, modelName, parentName, parentPath) {
    return this.replaceAggregation(type).then(() => {
      return this.queryManager.addFieldLike(modelName, parentName, this.get(parentPath));
    });
  },

  replaceAggregationWithGroup(type) {
    return this.replaceAggregationWithField(type, 'group', 'aggregation', 'query.aggregation');
  }

  replaceWindow(emitType, emitEvery, includeType) {
    return this.queryManager.replaceWindow(this.query, emitType, emitEvery, includeType);
  }

  addWindow() {
    this.emitType = EMIT_TYPES.get('TIME');
    this.includeType = INCLUDE_TYPES.get('WINDOW');
    return this.queryManager.addWindow(this.query);
  }

  deleteWindow() {
    return this.queryManager.deleteWindow(this.query);
  }

  reset() {
    this.isListening = false;
    this.hasError = false;
    this.hasSaved = false;
    $(this.queryBuilderInputs).removeAttr('disabled');
  }

  validate() {
    this.reset();
    let query = this.queryChangeset;
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
      return reject();
    });
  }

  @action
  addRawAggregation(selectType = false) {
    if (selectType) {
      this.replaceAggregationWithField(AGGREGATIONS.get('RAW'), 'projection', 'query', 'query');
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
  addFieldLike(childModelName, modelFieldName, modelPath) {
    this.queryManager.addFieldLike(childModelName, modelFieldName, this.get(modelPath));
  }

  @action
  modifyDistributionType(type) {
    this.setAttributes(type, this.pointType);
  }

  @action
  modifyDistributionPointType(type) {
    this.setAttributes(this.distributionType, type);
  }

  @action
  modifyFieldLike(fieldLike, field) {
    fieldLike.set('field', field);
    fieldLike.set('name', '');
    fieldLike.save();
  }

  @action
  deleteProjections() {
    this.queryManager.deleteProjections(this.query);
  }

  @action
  destroyModel(item) {
    this.queryManager.deleteModel(item);
  }

  @action
  handleMetricChange(metric, value) {
    metric.set('type', value.get('name'));
    metric.save();
  }

  @action
  changeEmitType(emitType) {
    if (isEqual(emitType, EMIT_TYPES.get('RECORD'))) {
      this.set('includeType', INCLUDE_TYPES.get('WINDOW'));
      this.replaceWindow(emitType, this.defaultEveryForRecordWindow, INCLUDE_TYPES.get('WINDOW'));
    } else {
      this.replaceWindow(emitType, this.defaultEveryForTimeWindow, this.includeType);
    }
  }

  @action
  changeIncludeType(includeType) {
    this.replaceWindow(this.emitType, this.get('query.window.emit.every'), includeType);
  }

  @action
  addWindow() {
    this.addWindow();
  }

  @action
  deleteWindow() {
    this.deleteWindow();
  }

  @action
  save() {
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
