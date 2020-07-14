/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { SUBFIELD_SEPARATOR } from 'bullet-ui/models/column';

export default class SchemaNameEntryComponent extends Component {
  get extractedValue() {
    let row = this.args.row;
    let name = row.get('name');
    return row.get('isSubfield') ? name.substring(name.lastIndexOf(SUBFIELD_SEPARATOR) + 1) : name;
  }
}
