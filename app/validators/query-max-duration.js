/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
export default function validateQueryMaxDuration() {
  return (key, newDuration, oldDuration, changes, content) => {
    let maxDuration = content.get('settings.defaultValues.durationMaxSecs') * 1000;
    if (newDuration > maxDuration) {
      return `The maintainer has configured Bullet to support a maximum of ${maxDuration} ms for maximum duration`;
    }
    return true;
  }
}
