/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import Filterizer from 'bullet-ui/mixins/filterizer';
import CORSRequest from 'bullet-ui/services/cors-request';
import { AGGREGATIONS } from 'bullet-ui/models/aggregation';

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
    if (aggregation) {
      json.aggregation = aggregation;
    }
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
    if (Ember.isEmpty(projections)) {
      return false;
    }
    let json = {};
    projections.forEach(item => {
      json[item.get('field')] = item.get('name');
    });
    return json;
  },

  reformatAggregation(aggregation) {
    if (Ember.isEmpty(aggregation)) {
      return false;
    }
    let json = {};
    let type = aggregation.get('type');
    json.size = Number(aggregation.get('size'));

    /*
     * TODO: Rewrite to include new aggregations.
     *
     * Temporary workaround till the backend fully implements aggregations. COUNT is now a GROUP operation.
     * The UI only supports a GROUP BY ALL, COUNT till the UI implements the new aggregations.
     */
    if (type === AGGREGATIONS.get('COUNT')) {
      json.type =  'GROUP';
      json.attributes = { operations: [{ type }] };
    } else {
      // Just LIMIT for now
      json.type = type;
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

