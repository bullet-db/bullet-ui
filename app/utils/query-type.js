/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import EmberObject from '@ember/object';
import Enum from 'bullet-ui/utils/enum';

export const QUERY_TYPES = Enum.of(['BUILDER', 'BQL']);

export function getQueryType(query) {
  if (query.isBQL) {
    return QUERY_TYPES.BQL;
  }
  return QUERY_TYPES.BUILDER;
}

export function makeBQLQueryLike(name) {
  let query = EmberObject.create({ name: name });
  query.isBQL = true;
  return query;
}

export function getRouteFor(query) {
  let type = getQueryType(query);
  switch (type) {
    case QUERY_TYPES.BUILDER:
      return 'query';
    case QUERY_TYPES.BQL:
      return 'bql';
  }
}
