/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import { SUBFIELD_SEPARATOR } from 'bullet-ui/models/column';
import Filterizer from 'bullet-ui/mixins/filterizer';

export default Ember.Route.extend(Filterizer, {
  corsRequest: Ember.inject.service(),
  // Filterizer mixins
  subfieldSeparator: SUBFIELD_SEPARATOR,
  subfieldSuffix: `${SUBFIELD_SEPARATOR}*`,
  apiMode: false,

  beforeModel() {
    let aggregation = this.store.createRecord('aggregation');
    aggregation.save();
    let query = this.store.createRecord('query', {
      aggregation: aggregation
    });
    return this.addDefaultFilter(query).then(() => {
      query.save();
      this.transitionTo('query', query.get('id'));
    });
  },

  /**
   * Creates and adds any default filter to the query.
   * @param {Object} query The query model object
   * @return {Object}      A Promise resolving to the created filter.
   */
  addDefaultFilter(query) {
    let fetchedFilter = this.get('cachedFilter');
    // If we already fetched and stored the default filter, use that.
    if (fetchedFilter) {
      return this.createFilter(fetchedFilter, query);
    }

    let defaultFilter = this.get('settings.defaultFilter');
    // Create an empty filter if we don't have defaults
    if (!defaultFilter) {
      return this.createFilter(this.get('emptyClause'), query);
    }

    // If we have a default filter in settings, use that. Assume it is in the API format.
    if (Ember.typeOf(defaultFilter) === 'object') {
      return this.createFilter(this.convertClauseToRule(defaultFilter), query);
    }

    // Otherwise, assume defaultFilter is an url to get the default filter from.
    return this.get('corsRequest').request(defaultFilter).then(filter => {
      let converted = this.convertClauseToRule(filter);
      this.set('cachedFilter', converted);
      return this.createFilter(converted, query);
    });
  },

  createFilter(filter, query) {
    if (!filter) {
      return Ember.RSVP.resolve();
    }
    let created = this.store.createRecord('filter', {
      clause: filter,
      query: query
    });
    return created.save();
  }
});
