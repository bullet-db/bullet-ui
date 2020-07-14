/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';

export default class SimpleAlertComponent extends Component {
  get alertIconClass() {
    switch (this.args.type) {
      case 'error':
        return 'fa fa-ban';
      case 'success':
        return 'fa fa-check-circle';
      case 'warning':
        return 'fa fa-flag';
      default:
        return '';
    }
  }

  get alertClass() {
    switch (this.args.type) {
      case 'error':
        return 'alert-danger';
      case 'success':
        return 'alert-success';
      case 'warning':
        return 'alert-warning';
      default:
        return '';
    }
  }
}
