/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { action, computed } from '@ember/object';
import { typeOf } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/components/paginated-table';

export default class SchemaTableComponent extends PaginatedTable {
  @tracked fields;

  columns = A([
    { label: 'Field', width: '250px', valuePath: 'name', cellComponent: 'cells/schema-name-entry' },
    { label: 'Type', width: '250px', valuePath: 'qualifiedType', cellComponent: 'cells/schema-type-entry' },
    { label: 'Description', valuePath: 'description', cellComponent: 'cells/schema-description-entry' }
  ]);

  constructor() {
    super(...arguments);
    this.fields = this.args.fields;
    this.pageSize = 10;
    this.table = Table.create({ columns: this.columns });
    this.sortBy('name', 'ascending');
    this.addPages(2);
  }

  @computed('fields.[]')
  get rows() {
    // This needs to handle arrays (for enumeratedColumns) and the model result collection
    return typeOf(this.fields) === 'array' ? this.fields : this.fields.toArray();
  }

  @action
  onRowClick(row) {
    if (!row.get('hasEnumerations')) {
      row.set('expanded', false);
    }
  }
}
