/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import Filterizer from 'bullet-ui/mixins/filterizer';
import CORSRequest from 'bullet-ui/services/cors-request';
import { AGGREGATIONS, DISTRIBUTIONS } from 'bullet-ui/models/aggregation';
import { METRICS } from 'bullet-ui/models/metric';

export default CORSRequest.extend(Filterizer, {
  subfieldSuffix: '.*',
  subfieldSeparator: '.',
  delimiter: ',',

  host: Ember.computed('settings', function() {
    return this.get('settings.drpcHost');
  }),

  namespace: Ember.computed('settings', function() {
    return this.get('settings.drpcNamespace');
  }),

  path: Ember.computed('settings', function() {
    return this.get('settings.drpcPath');
  }),

  /**
   * Recreates a Ember Data like representation from an API query specification.
   * @param  {Object} json The API Bullet query.
   * @return {Object}      A vanilla Object that looks like the Ember Data representation.
   */
  recreate(json) {
    let query = { };
    let clause = this.recreateFilter(json.filters);
    let projection = this.recreateProjections(json.projection);
    let aggregation = this.recreateAggregation(json.aggregation);

    let filter = { };
    this.assignIfTruthy(filter, 'clause', clause);
    // One additional non-API key placed into the object for summarizing. Copy the summary as is
    this.assignIfTruthy(filter, 'summary', json.filterSummary);

    this.assignIfTruthy(query, 'filter', filter);
    this.assignIfTruthy(query, 'projections', projection);
    this.assignIfTruthy(query, 'aggregation', aggregation);
    query.duration = Number(query.duration / 1000);

    return query;
  },

  /**
   * Converts an internal Ember Bullet query to the API query specification.
   * @param  {Object} query An Ember Data object representing the query.
   * @return {Object}       The API Bullet query.
   */
  reformat(query) {
    let json = { };
    let filter = this.reformatFilter(query.get('filter'));
    let projection = this.reformatProjections(query.get('projections'));
    let aggregation = this.reformatAggregation(query.get('aggregation'));

    if (filter) {
      json.filters = [filter];
    }
    if (projection) {
      json.projection = { fields: projection };
    }
    this.assignIfTruthy(json, 'aggregation', aggregation);
    json.duration = Number(query.get('duration')) * 1000;
    return json;
  },

  recreateFilter(json) {
    if (Ember.isNone(json)) {
      return false;
    }
    let rule = json[0];
    return this.convertClauseToRule(rule);
  },

  reformatFilter(filter) {
    if (Ember.isNone(filter)) {
      return false;
    }
    let clause = filter.get('clause');
    if (!clause || Ember.$.isEmptyObject(clause)) {
      return false;
    }
    let converted = this.convertRuleToClause(clause);
    let innerClauses = converted.clauses;
    if (Ember.isEmpty(innerClauses)) {
      return false;
    }
    // If we got here, we should have a valid clause.
    let innerClause = converted.clauses[0];
    // Unbox if it's a single simple filter nested inside
    if (innerClauses.length === 1 && !this.isLogical(innerClause.operation)) {
      return innerClause;
    }
    return converted;
  },

  recreateProjections(json) {
    return this.makeFields(json);
  },

  reformatProjections(projections) {
    return this.getFields(projections);
  },

  recreateAggregation(json) {
    if (Ember.isEmpty(json)) {
      return false;
    }
    let aggregation = { };
    let groups = this.makeFields(json.fields);
    let metrics = this.makeMetrics(json.attributes);
    let attributes = this.makeAttributes(json.attributes);

    aggregation.type = AGGREGATIONS.get(json.type);
    this.assignIfTruthy(aggregation, 'groups', groups);
    this.assignIfTruthy(aggregation, 'metrics', metrics);
    this.assignIfTruthy(aggregation, 'attributes', attributes);
    aggregation.size = Number(json.size);

    return json;
  },

  reformatAggregation(aggregation) {
    if (Ember.isEmpty(aggregation)) {
      return false;
    }
    let json = { };
    let fields = this.getFields(aggregation.get('groups'));
    let attributes = this.getAttributes(aggregation);

    json.type = AGGREGATIONS.apiKey(aggregation.get('type'));
    json.size = Number(aggregation.get('size'));
    this.assignIfTruthy(json, 'fields', fields);
    this.assignIfTruthy(json, 'attributes', attributes);

    return json;
  },

  makeFields(json, fieldName = 'field', valueName = 'name') {
    if (Ember.isEmpty(json)) {
      return false;
    }
    let fields = [];
    for (let key in json) {
      let field = { };
      field[fieldName] = key;
      field[valueName] = json[key];
      fields.push(field);
    }
    return fields;
  },

  getFields(enumerable, sourceName = 'field', targetName = 'name') {
    if (Ember.isEmpty(enumerable)) {
      return false;
    }
    let json = { };
    enumerable.forEach(item => {
      json[item.get(sourceName)] = item.get(targetName);
    });
    return json;
  },

  makeAttributes(json) {
    if (Ember.isEmpty(json)) {
      return false;
    }

    let attributes = { };

    // COUNT_DISTINCT, TOP_K
    this.assignIfTruthy(attributes, 'newName', json.newName);

    // DISTRIBUTION
    this.assignIfTruthyNumeric(attributes, 'start', json.start);
    this.assignIfTruthyNumeric(attributes, 'end', json.end);
    this.assignIfTruthyNumeric(attributes, 'increment', json.increment);
    this.assignIfTruthyNumeric(attributes, 'numberOfPoints', json.numberOfPoints);
    this.assignIfTruthy(attributes, 'points', this.makePoints(json.points));
    this.assignIfTruthy(attributes, 'type', DISTRIBUTIONS.get(json.type));

    // TOP_K
    this.assignIfTruthyNumeric(attributes, 'threshold', json.threshold);

    return Ember.$.isEmptyObject(attributes) ? false : attributes;
  },

  getAttributes(aggregation) {
    let json = { };

    // COUNT_DISTINCT, TOP_K
    this.assignIfTruthy(json, 'newName', aggregation.get('attributes.newName'));

    // DISTRIBUTION
    this.assignIfTruthyNumeric(json, 'start', aggregation.get('attributes.start'));
    this.assignIfTruthyNumeric(json, 'end', aggregation.get('attributes.end'));
    this.assignIfTruthyNumeric(json, 'increment', aggregation.get('attributes.increment'));
    this.assignIfTruthyNumeric(json, 'numberOfPoints', aggregation.get('attributes.numberOfPoints'));
    this.assignIfTruthy(json, 'points', this.getPoints(aggregation.get('attributes.points')));
    this.assignIfTruthy(json, 'type', DISTRIBUTIONS.apiKey(aggregation.get('attributes.type')));

    // TOP_K
    this.assignIfTruthyNumeric(json, 'threshold', aggregation.get('attributes.threshold'));

    // GROUP
    let operations = this.getGroupOperations(aggregation.get('metrics'));
    this.assignIfTruthy(json, 'operations', operations);

    return Ember.$.isEmptyObject(json) ? false : json;
  },

  makeMetrics(attributes) {
    if (Ember.isEmpty(attributes)) {
      return false;
    }
    return this.makeGroupOperations(attributes.operations);
  },

  makeGroupOperations(json) {
    if (Ember.isEmpty(json)) {
      return false;
    }
    let groupOperations = [];
    json.forEach(item => {
      let type = METRICS.get(item.type);
      let operation = { type };
      this.assignIfTruthy(operation, 'field', item.field);
      this.assignIfTruthy(operation, 'name', item.newName);
      groupOperations.push(operation);
    });
    return groupOperations;
  },

  getGroupOperations(metrics) {
    if (Ember.isEmpty(metrics)) {
      return false;
    }
    let json = [];
    metrics.forEach(item => {
      let invertedType = METRICS.invert(item.get('type'));
      let metric = { type: invertedType };
      this.assignIfTruthy(metric, 'field', item.get('field'));
      this.assignIfTruthy(metric, 'newName', item.get('name'));
      json.push(metric);
    });
    return json;
  },

  makePoints(points) {
    let joined = '';
    if (!Ember.isEmpty(points)) {
      joined = points.join(',');
    }
    return joined;
  },

  getPoints(points) {
    let json = [];
    if (!Ember.isEmpty(points)) {
      points.split(',').map(s => s.trim()).forEach(n =>  json.push(parseFloat(n)));
    }
    return json;
  },

  assignIfTruthyNumeric(json, key, value) {
    if (!Ember.isEmpty(value)) {
      json[key] = parseFloat(value);
    }
    return json;
  },

  assignIfTruthy(json, key, value) {
    // Also works for boolean false -> Object.keys(false) = []
    if (!Ember.isEmpty(value) && Object.keys(value).length !== 0) {
      json[key] = value;
    }
    return json;
  },

  /**
   * Exposes the low-level XMLHTTPRequest response object in order to abort. In order to not expose the parsing
   * logic, this method does not use Promises or the Promise API of the XMLHTTPRequest object.
   *
   * @param  {Object} data             The Query model.
   * @param  {Function} successHandler The function to invoke on success.
   * @param  {Function} errorHandler   The function to invoke on failure.
   * @param  {Object} context          The this context for the success and error handlers.
   * @return {Object}                  The XMLHTTPRequest object from JQuery representing the ajax call.
   */
  send(data, successHandler, errorHandler, context) {
    data = this.reformat(data);
    let path = this.get('path');
    let options = {
      data: JSON.stringify(data),
      type: 'POST',
      processData: false,
      contentType: 'text/plain'
    };
    options = this.options(path, options);
    let requestData = { type: 'POST', url: options.url };
    options.success = (data, textStatus, jqXHR) => {
      let response = this.handleResponse(jqXHR.status, this.parseHeaders(jqXHR.getAllResponseHeaders()), data, requestData);
      Ember.run.join(null, this.hasAjaxError(response) ? errorHandler : successHandler,  response, context);
    };
    options.error = (jqXHR, textStatus, errorThrown) => {
      let response = this.parseErrorResponse(jqXHR.responseText) || errorThrown;
      // Ignore aborts.
      if (textStatus !== 'abort') {
        Ember.run.join(null, errorHandler, response, context);
      }
    };
    return Ember.$.ajax(options);
  }
});
