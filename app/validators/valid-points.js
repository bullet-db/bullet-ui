/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { isEmpty, isEqual } from '@ember/utils';
import { AGGREGATIONS, DISTRIBUTIONS, DISTRIBUTION_POINTS } from 'bullet-ui/models/aggregation';
import currentValue from 'bullet-ui/utils/current-value';

export default function validatePoints() {
  return (key, newType, oldType, changes, content) => {
    if (!isEqual(newType, AGGREGATIONS.get('DISTRIBUTION'))) {
      return true;
    }
    let {
      'attributes.pointType' : pointType
    } = currentValue(changes, content, ['attributes.type']);

    if (isEqual(pointType, DISTRIBUTION_POINTS.get('POINTS'))) {
      return validateFreeFormPoints(newType, changes, content);
    } else if (isEqual(pointType, DISTRIBUTION_POINTS.get('NUMBER'))) {
      return validateNumberOfPoints(changes, content);
    } else if (isEqual(pointType, DISTRIBUTION_POINTS.get('GENERATED'))) {
      return validateGeneratedPoints(newType, changes, content);
    }
  }
}

function validateMaximumPoints(size, content) {
  let maxPoints = content.get('settings.defaultValues.sketches.distributionMaxNumberOfPoints');
  if (size > maxPoints) {
    return `The maintainer has set the maximum number of points you can generate to be ${maxPoints}`;
  }
  return true;
}

function validateFreeFormPoints(type, changes, content) {
  let {
    'attributes.points' : points
  } = currentValue(changes, content, ['attributes.points']);

  if (isEmpty(points)) {
    return `You must specify a comma separated list of points for this option`;
  }
  let pointList = points.split(',').map(s => s.trim());
  let badPoints = pointList.filter(s => !$.isNumeric(s));
  if (!isEmpty(badPoints)) {
    return `These are not valid points: ${badPoints.join()}`;
  }
  if (isEqual(type, DISTRIBUTIONS.get('QUANTILE'))) {
    let badRange = pointList.map(s => parseFloat(s)).filter(f => f < 0 || f > 1);
    if (!isEmpty(badRange)) {
      return `Quantiles requires points between 0 and 1. These are not: ${badRange.join()}`;
    }
  }
  return validateMaximumPoints(pointList.length, content);
}

function validateNumberOfPoints(changes, content) {
  let {
    'attributes.numberOfPoints' : numberOfPoints
  } = currentValue(changes, content, ['attributes.numberOfPoints']);

  if (isEmpty(numberOfPoints)) {
    return `You must specify the Number of Points you want to generate`;
  }
  numberOfPoints = parseFloat(numberOfPoints);
  if (numberOfPoints <= 0) {
    return `You must specify a positive Number of Points`;
  }
  return validateMaximumPoints(numberOfPoints, content);
}

function validateGeneratedPoints(type, changes, content) {
  let {
    'attributes.start' : start,
    'attributes.end' : end,
    'attributes.increment' : increment
  } = currentValue(changes, content, ['attributes.start', 'attributes.end', 'attributes.increment']);

  if (isEmpty(start) || isEmpty(end) || isEmpty(increment)) {
    return `You must specify the Start, End and Increment for the points you want to generate`;
  }
  start = parseFloat(start);
  end = parseFloat(end);
  increment = parseFloat(increment);
  if (start >= end) {
    return `You must specify Start less than End`;
  }
  if (increment <= 0) {
    return `You must specify a positive Increment`;
  }
  if (isEqual(type, DISTRIBUTIONS.get('QUANTILE')) && (start < 0 || end > 1)) {
    return 'Quantiles requires that you specify a Start and End between 0 and 1';
  }
  let numberOfPoints = (end - start) / increment;
  return validateMaximumPoints(numberOfPoints, content);
}
