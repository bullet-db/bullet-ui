/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import $ from 'jquery';
import JSONFormatterModule from 'json-formatter-js';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import argsGet from 'bullet-ui/utils/args-get';

const JSONFormatter = JSONFormatterModule.default;

export default class PrettyJsonComponent extends Component {
  get defaultLevels() {
    return argsGet(this.args, 'defaultLevels', 2);
  }

  get data() {
    let formatter = new JSONFormatter(this.args.data, this.defaultLevels, { hoverPreviewEnabled: true });
    return formatter.render();
  }

  @action
  onInsert(element) {
    $(element).empty().append(this.data);
  }
}
