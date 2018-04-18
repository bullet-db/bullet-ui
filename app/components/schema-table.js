/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { A } from '@ember/array';
import { typeOf } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/mixins/paginated-table';

export default Component.extend(PaginatedTable, {
  classNames: ['schema-table'],
  classNameBindings: ['isNested'],
  queries: null,
  pageSize: 10,
  isFixed: true,
  /**
   * If set to true, the table behaves as a nested table without headers and will not expand further. Meant to
   * be used when the table is nested within itself.
   *
   * @type {Boolean}
   */
  isNested: false,

  rows: computed('fields.[]', function() {
    let fields = this.get('fields');
    // This needs to handle arrays (for enumeratedColumns) and the model result collection
    return typeOf(fields) === 'array' ? fields : fields.toArray();
  }),

  columns: A([
    { label: 'Field', width: '250px', valuePath: 'name', cellComponent: 'cells/schema-name-entry' },
    { label: 'Type', width: '250px', valuePath: 'qualifiedType', cellComponent: 'cells/schema-type-entry' },
    { label: 'Description', valuePath: 'description', cellComponent: 'cells/schema-description-entry' }
  ]),

  init() {
    this._super(...arguments);
    this.set('table', new Table(this.get('columns')));
    this.sortBy('name', 'ascending');
    this.addPages(2);
  },

  actions: {
    onRowClick(row) {
      if (!row.get('hasEnumerations')) {
        row.set('expanded', false);
      }
    }
  }
});
