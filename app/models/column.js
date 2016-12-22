/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import DS from 'ember-data';

export const SUBFIELD_SEPARATOR = '.';

export default DS.Model.extend({
  name: DS.attr('string'),
  type: DS.attr('string'),
  subtype: DS.attr('string'),
  description: DS.attr('string'),
  enumerations: DS.attr(),

  qualifiedType: Ember.computed('type', 'subtype', function() {
    let type = this.get('type');
    let subType = this.get('subtype');
    let qualifiedType = type;
    if (!Ember.isEmpty(subType)) {
      qualifiedType = type === 'MAP' ? `MAP OF STRINGS TO ${subType}S` : `${type} OF ${subType}S`;
    }
    return qualifiedType;
  }),

  hasEnumerations: Ember.computed('enumerations', function() {
    return !Ember.isEmpty(this.get('enumerations'));
  }).readOnly(),

  hasFreeformField: Ember.computed('type', 'subtype', 'enumerations', function() {
    return this.get('type') === 'MAP' && !Ember.isEmpty(this.get('subtype')) && Ember.isEmpty(this.get('enumerations'));
  }).readOnly(),

  enumeratedColumns: Ember.computed('name', 'subtype', 'enumerations', function() {
    let subColumns = Ember.A(this.get('enumerations'));
    if (Ember.isEmpty(subColumns)) {
      return false;
    }
    let subColumnType = this.get('subtype');
    return subColumns.map((item) => {
      let subColumn = Ember.Object.create(item);
      let name = this.get('name');
      subColumn.set('name', `${name}${SUBFIELD_SEPARATOR}${item.name}`);
      subColumn.set('type', subColumnType);
      subColumn.set('qualifiedType', subColumnType);
      subColumn.set('description', item.description);
      subColumn.set('isSubfield', true);
      return subColumn;
    }, this);
  }).readOnly(),

  flattenedColumns: Ember.computed('type', 'subtype', 'enumeratedColumns', function() {
    let simplifiedColumns = Ember.A();
    // The main column
    simplifiedColumns.pushObject(Ember.Object.create({
      name: this.get('name'),
      type: this.get('type')
    }));
    // The free form subfield
    let hasFreeformField = this.get('hasFreeformField');
    if (hasFreeformField) {
      simplifiedColumns.pushObject(Ember.Object.create({
        name: this.get('name'),
        type: this.get('subtype'),
        description: this.get('description'),
        hasFreeformField: hasFreeformField
      }));
    }
    let enumerated = this.get('enumeratedColumns');
    if (enumerated) {
      simplifiedColumns.addObjects(enumerated);
    }
    return simplifiedColumns;
  }).readOnly()
});
