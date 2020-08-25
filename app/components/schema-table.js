/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { action } from '@ember/object';
import { typeOf } from '@ember/utils';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/components/paginated-table';

export default class SchemaTableComponent extends PaginatedTable {
  columns = A([
    { label: 'Field', width: '250px', valuePath: 'name', cellComponent: 'cells/schema-name-entry' },
    { label: 'Type', width: '300px', valuePath: 'typeName', cellComponent: 'cells/schema-type-entry' },
    { label: 'Description', valuePath: 'description', cellComponent: 'cells/schema-description-entry' }
  ]);
  rows;

  constructor() {
    super(...arguments);
    this.pageSize = 10;
    this.rows = SchemaTableComponent.fieldsToRows(this.args.fields);
    this.table = Table.create({ columns: this.columns });
    this.sortBy('name', 'ascending');
    this.addPages(2);
  }

  static fieldsToRows(fields) {
    // This needs to handle arrays (for enumeratedColumns) and the model result collection
    return typeOf(fields) === 'array' ? fields : fields.toArray();
  }

  @action
  onRowClick(row) {
    if (!row.get('hasEnumerations')) {
      row.set('expanded', false);
    }
  }
}
