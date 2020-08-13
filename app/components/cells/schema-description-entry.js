/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { htmlSafe } from '@ember/string';
import Component from '@glimmer/component';

export default class SchemaDescriptionEntryComponent extends Component {
  get htmlSafeValue() {
    return htmlSafe(this.args.value);
  }
}
