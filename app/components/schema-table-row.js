/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { alias } from '@ember/object/computed';
import RowComponent from 'ember-light-table/components/lt-row';

// This needs to remain a classic component because ember-light-table's lt-row is a classic component
export default RowComponent.extend({
  classNameBindings: ['hasEnumerations'],
  hasEnumerations: alias('row.hasEnumerations')
});
