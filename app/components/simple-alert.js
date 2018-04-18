/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['simple-alert'],
  type: null,

  alertIconClass: computed('type', function() {
    switch (this.get('type')) {
      case 'error':
        return 'glyphicon glyphicon-ban-circle';
      case 'success':
        return 'glyphicon glyphicon-ok-sign';
      case 'warning':
        return 'glyphicon glyphicon-flag';
      default:
        return '';
    }
  }),

  alertClass: computed('type', function() {
    switch (this.get('type')) {
      case 'error':
        return 'alert-danger';
      case 'success':
        return 'alert-success';
      case 'warning':
        return 'alert-warning';
      default:
        return '';
    }
  })
});
