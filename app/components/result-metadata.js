/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['result-metadata'],
  classNameBindings: ['expanded:is-expanded'],
  expanded: false,
  expansionIconClasses: Ember.computed('expanded', function() {
    return this.get('expanded') ? 'glyphicon glyphicon-menu-up' : 'glyphicon glyphicon-menu-down';
  }),

  actions: {
    toggleExpanded() {
      this.toggleProperty('expanded');
    }
  }
});
