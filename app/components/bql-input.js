/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { A } from '@ember/array';
import { action, computed } from '@ember/object';
import isEmpty from 'bullet-ui/utils/is-empty';
import { getTypeClass } from 'bullet-ui/utils/type';
import { addCodeEditor } from 'bullet-ui/utils/codemirror-adapter';

export default class BqlInputComponent extends Component {
  editorClass = 'editor';

  @tracked isListening = false;
  @tracked isValidating = false;
  @tracked hasError = false;
  @tracked hasSaved = false;
  @tracked errors;

  queryChangeset;
  settings;

  constructor() {
    super(...arguments);
    this.settings = getOwner(this).lookup('settings:main');
    this.errors = A();
    this.queryChangeset = this.args.query;
  }

  @computed('args.schema')
  get columns() {
    let columns = [];
    let schema = this.args.schema;
    if (isEmpty(schema)) {
      return columns;
    }
    return schema.reduce((previous, item) => {
      let flattenedColumns = item.flattenedColumns;
      return previous.concat(flattenedColumns.map(flatColumn => {
        return { name: flatColumn.name, type: flatColumn.type, typeClass: getTypeClass(flatColumn.type) };
      }));
    }, columns);
  }

  reset() {
    this.isListening = false;
    this.hasError = false;
    this.hasSaved = false;
    this.errors = A();
  }

  async validate() {
    this.reset();
    let validations;
    if (!isEmpty(validations)) {
      throw validations;
    }
  }

  async doSave() {
    try {
      await this.validate();
      await this.args.onSaveQuery();
      this.hasSaved = true;
    } catch (errors) {
      this.hasError = true;
      this.errors = A(errors);
      throw errors;
    }
  }

  @action
  addEditor(element) {
    addCodeEditor(element, this.queryChangeset.get('query'));
  }

  @action
  async save() {
    try {
      await this.doSave();
    } catch {
      // empty
    }
  }

  @action
  async listen() {
    try {
      await this.doSave();
      this.isListening = true;
      this.args.onSubmitQuery();
    } catch {
      // empty
    }
  }
}
