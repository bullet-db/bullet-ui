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

  reformat(query) {
    let json = {};
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

  reformatProjections(projections) {
    return this.getFields(projections);
  },

  reformatAggregation(aggregation) {
    if (Ember.isEmpty(aggregation)) {
      return false;
    }
    let json = {};
    let fields = this.getFields(aggregation.get('groups'));
    let attributes = this.getAttributes(aggregation);

    json.type = this.findType(aggregation.get('type'));
    json.size = Number(aggregation.get('size'));
    this.assignIfTruthy(json, 'fields', fields);
    this.assignIfTruthy(json, 'attributes', attributes);

    return json;
  },

  getFields(enumerable, sourceName = 'field', targetName = 'name') {
    if (Ember.isEmpty(enumerable)) {
      return false;
    }
    let json = {};
    enumerable.forEach(item => {
      json[item.get(sourceName)] = item.get(targetName);
    });
    return json;
  },

  getAttributes(aggregation) {
    let json = {};

    // COUNT_DISTINCT, TOP_K
    this.assignIfTruthy(json, 'newName', aggregation.get('attributes.newName'));

    // DISTRIBUTION
    this.assignIfTruthyNumeric(json, 'start', aggregation.get('attributes.start'));
    this.assignIfTruthyNumeric(json, 'end', aggregation.get('attributes.end'));
    this.assignIfTruthyNumeric(json, 'increment', aggregation.get('attributes.increment'));
    this.assignIfTruthyNumeric(json, 'numberOfPoints', aggregation.get('attributes.numberOfPoints'));
    this.assignIfTruthy(json, 'points', this.getPoints(aggregation.get('attributes.points')));
    this.assignIfTruthy(json, 'type', this.findDistributionType(aggregation.get('attributes.type')));

    // TOP_K
    this.assignIfTruthyNumeric(json, 'threshold', aggregation.get('attributes.threshold'));

    // GROUP
    let operations = this.getGroupOperations(aggregation.get('metrics'));
    this.assignIfTruthy(json, 'operations', operations);

    return Ember.$.isEmptyObject(json) ? false : json;
  },

  getGroupOperations(metrics) {
    let json = [];
    if (!Ember.isEmpty(metrics)) {
      metrics.forEach(item => {
        let invertedType = METRICS.invert(item.get('type'));
        let metric = { type: invertedType };
        this.assignIfTruthy(metric, 'field', item.get('field'));
        this.assignIfTruthy(metric, 'newName', item.get('name'));
        json.push(metric);
      });
    }
    return json;
  },

  getPoints(points) {
    let json = [];
    if (!Ember.isEmpty(points)) {
      points.split(',').map(s => s.trim()).filter(s => Ember.$.isNumeric(s)).forEach(n =>  json.push(parseFloat(n)));
    }
    return json;
  },

  findType(type) {
    let apiType = AGGREGATIONS.invert(type);
    apiType = apiType.replace(/_/g, ' ');
    return apiType;
  },

  findDistributionType(type) {
    return DISTRIBUTIONS.invert(type);
  },

  assignIfTruthyNumeric(json, key, value) {
    if (!Ember.isEmpty(value)) {
      json[key] = parseFloat(value);
    }
    return json;
  },

  assignIfTruthy(json, key, value) {
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
