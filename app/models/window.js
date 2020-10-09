/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Model, { attr, belongsTo } from '@ember-data/model';
import { EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/utils/query-constants';

export default class WindowModel extends Model {
  @attr('string', { defaultValue: EMIT_TYPES.describe(EMIT_TYPES.TIME) }) emitType;
  @attr('number', { defaultValue: 2 }) emitEvery;
  @attr('string', { defaultValue: INCLUDE_TYPES.describe(INCLUDE_TYPES.WINDOW) }) includeType;
  @belongsTo('query', { autoSave: true }) query;
}
