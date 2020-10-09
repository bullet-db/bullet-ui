/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Enum from 'bullet-ui/utils/enum';

export const QUERY_TYPES = Enum.of(['BUILDER', 'BQL']);

export function getQueryType(query) {
  if (query.isBQL) {
    return QUERY_TYPES.BQL;
  }
  return QUERY_TYPES.BUILDER;
}
