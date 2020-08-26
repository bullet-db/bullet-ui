/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { MAP_ACCESSOR } from 'bullet-ui/utils/type';

export default class SchemaNameEntryComponent extends Component {
  get extractedValue() {
    let row = this.args.row;
    let name = row.get('name');
    return row.get('isSubField') ? name.substring(name.lastIndexOf(MAP_ACCESSOR) + 1) : name;
  }
}
