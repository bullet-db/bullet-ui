/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import Table from 'ember-light-table';
import PaginatedTable from 'bullet-ui/mixins/paginated-table';

export default Ember.Component.extend(PaginatedTable, {
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

  rows: Ember.computed('fields.[]', function() {
    let fields = this.get('fields');
    // This needs to handle arrays (for enumeratedColumns) and the model result collection
    return Ember.typeOf(fields) === 'array' ? fields : fields.toArray();
  }),

  columns: Ember.A([
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
    onColumnClick(column) {
      this.reset();
      this.sortBy(column.valuePath, column.ascending ? 'ascending' : 'descending');
      this.addPages();
    },

    onRowClick(row) {
      if (!row.get('hasEnumerations')) {
        row.set('expanded', false);
      }
    },

    onScrolledToBottom() {
      if (this.get('haveMoreRows') && !this.get('isDestroyed') && !this.get('isDestroying')) {
        this.addPages();
      }
    }
  }
});
