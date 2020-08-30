/*
 *  Copyright 2020, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual, isEmpty, isNone, typeOf } from '@ember/utils';
import { AGGREGATION_TYPES, EMIT_TYPES, INCLUDE_TYPES } from 'bullet-ui/utils/query-constants';

/**
 * This exists because when working across changesets, we do not want to connect them to each other till the final save.
 * We do not want to connect them when validating it. The best compromise then is to have this where the functions are
 * in the style of validations but take all the relevant changesets rather than look through their relationships.

 * @param {object} settings The settings object injected into the application instance.
 * @param {object} changesets All the changesets or arrays of changesets.
 * @return {array} An array containing string error messages or empty if there were no errors.
 */
export default function validateMultiModelRelationships(settings, changesets) {
  // Also has projections but currently unused
  let { query, aggregation, window, groups, metrics } = changesets;
  let validations = [
    validateWindowAggregation(window, aggregation),
    validateGroupMetricPresence(aggregation, groups, metrics),
    validateWindowEmitFrequency(settings, query, window)
  ]
  return validations.filter(result => typeOf(result) === 'string');
}

export function validateWindowAggregation(window, aggregation) {
  if (isNone(window)) {
    return true;
  }
  const RAW = AGGREGATION_TYPES.describe(AGGREGATION_TYPES.RAW);
  let aggregationType = aggregation.get('type');
  let emitType = window.get('emitType');
  let includeType = window.get('includeType');
  if (isEqual(aggregationType, RAW) && isEqual(includeType, INCLUDE_TYPES.describe(INCLUDE_TYPES.ALL))) {
    return `The window should not include all from start when aggregation type is ${RAW}`;
  }
  if (!isEqual(aggregationType, RAW) && isEqual(emitType, EMIT_TYPES.describe(EMIT_TYPES.RECORD))) {
    return `The window should not be record based when aggregation type is not ${RAW}`;
  }
  return true;
}

export function validateGroupMetricPresence(aggregation, groups, metrics) {
  let newType = aggregation.get('type');
  if (isEqual(newType, AGGREGATION_TYPES.describe(AGGREGATION_TYPES.GROUP)) && isEmpty(groups) && isEmpty(metrics)) {
    return 'If you are grouping data, you must add at least one Group Field and/or Metric Field';
  }
  return true;
}

export function validateWindowEmitFrequency(settings, query, window) {
  if (isNone(window)) {
    return true;
  }
  let emitType = window.get('emitType');
  let emitEvery = window.get('emitEvery');
  let duration = query.get('duration');
  if (isEqual(emitType, EMIT_TYPES.describe(EMIT_TYPES.TIME))) {
    emitEvery = parseFloat(emitEvery);
    duration = parseFloat(duration);
    let windowEmitFrequencyMinSecs = settings.get('defaultValues.windowEmitFrequencyMinSecs');
    if (emitEvery > duration) {
      return `The window emit frequency should not be longer than the query duration (${duration} seconds)`;
    } else if (emitEvery < windowEmitFrequencyMinSecs) {
      return `The maintainer has configured Bullet to support a minimum of ${windowEmitFrequencyMinSecs}s for emit frequency`;
    }
  }
  return true;
}
