/*
 *  Copyright 2018, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEqual } from '@ember/utils';
import { EMIT_TYPES } from 'bullet-ui/models/window';
import currentValue from 'bullet-ui/utils/current-value';

export default function validateWindowEmitFrequency() {
  return (key, newEmitEvery, oldEmitEvery, changes, content) => {
    let { emitType, 'query.duration': duration } = currentValue(changes, content, ['emitType', 'query.duration']);
    if (isEqual(emitType, EMIT_TYPES.get('TIME'))) {
      let windowEmitFrequencyMinSecs = content.get('settings.defaultValues.windowEmitFrequencyMinSecs');
      if (newEmitEvery > duration) {
        return `The window emit frequency should not be longer than the query duration (${duration} seconds)`;
      } else if (newEmitEvery < windowEmitFrequencyMinSecs) {
        return `The maintainer has configured Bullet to support a minimum of ${windowEmitFrequencyMinSecs}s for emit frequency`;
      }
    }
    return true;
  }
}
