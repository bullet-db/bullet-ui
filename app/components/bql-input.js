/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { A } from '@ember/array';
import { action, computed } from '@ember/object';
import { isNone } from '@ember/utils';
import isEmpty from 'bullet-ui/utils/is-empty';
import { addEditor, getEditorContent } from 'bullet-ui/utils/codemirror-adapter';
import QueryConverter from 'bullet-ui/utils/query-converter';

export default class BqlInputComponent extends Component {
  editorClass = 'editor';

  @tracked isListening = false;
  @tracked isValidating = false;
  @tracked hasError = false;
  @tracked hasSaved = false;
  @tracked errors;
  @service('cors-request') corsRequest;

  queryChangeset;
  settings;
  editor;

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
      return previous.concat(flattenedColumns.map(flatColumn => flatColumn.name));
    }, columns);
  }

  get validationURL() {
    let { queryHost, queryNamespace, validationPath } = this.settings;
    return `${queryHost}/${queryNamespace}/${validationPath}`;
  }

  async parseError(response) {
    let json = await response.json();
    let errors = json.meta.errors;
    let parsedErrors = [];
    for (let object of errors) {
      let { error } = object;
      let splits = error.split(':');
      let line = 0;
      let character = 0;
      let message = error;
      if (splits.length >= 3) {
        line = splits[0];
        character = splits[1];
        message = splits.slice(2).join(':');
      }
      parsedErrors.push({ line, character, message });
    }
    return parsedErrors;
  }

  reset() {
    this.isListening = false;
    this.hasError = false;
    this.hasSaved = false;
    this.errors = A();
  }

  async validate(query) {
    this.reset();
    try {
      await this.corsRequest.post(this.validationURL, query);
    } catch (errorResponse) {
      let errors = await this.parseError(errorResponse);
      throw errors;
    }
  }

  async doSave() {
    try {
      let query = getEditorContent(this.editor);
      await this.validate(query);
      this.queryChangeset.set('query', QueryConverter.normalizeQuery(query));
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
    this.editor = addEditor(element, this.columns, this.queryChangeset.get('query'));
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
