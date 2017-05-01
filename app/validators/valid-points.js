/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';
import BaseValidator from 'ember-cp-validations/validators/base';
import { AGGREGATIONS, DISTRIBUTIONS, DISTRIBUTION_POINTS } from 'bullet-ui/models/aggregation';

const Validoints = BaseValidator.extend({
  validateMaximumPoints(size, model) {
    let maxPoints = model.get('settings.defaultValues.sketches.distributionMaxNumberOfPoints');
    if (size > maxPoints) {
      return `The maintainer has set the maximum number of points you can generate to be ${maxPoints}`;
    }
    return true;
  },

  validateFreeFormPoints(model) {
    let points = model.get('attributes.points');
    if (Ember.isEmpty(points)) {
      return `You must specify a comma separated list of points for this option`;
    }
    let pointList = points.split(',').map(s => s.trim());
    let badPoints = pointList.filter(s => !Ember.$.isNumeric(s));
    if (!Ember.isEmpty(badPoints)) {
      return `These are not valid points: ${badPoints.join()}`;
    }
    let type = model.get('attributes.type');
    if (Ember.isEqual(type, DISTRIBUTIONS.get('QUANTILE'))) {
      let badRange = pointList.map(s => parseFloat(s)).filter(f => f < 0 || f > 1);
      if (!Ember.isEmpty(badRange)) {
        return `Quantiles requires points between 0 and 1. These are not: ${badRange.join()}`;
      }
    }
    return this.validateMaximumPoints(pointList.length, model);
  },

  validateNumberOfPoints(model) {
    let numberOfPoints = model.get('attributes.numberOfPoints');
    if (Ember.isEmpty(numberOfPoints)) {
      return `You must specify the Number of Points you want to generate`;
    }
    numberOfPoints = parseFloat(numberOfPoints);
    if (numberOfPoints <= 0) {
      return `You must specify a positive Number of Points`;
    }
    return this.validateMaximumPoints(numberOfPoints, model);
  },

  validateGeneratedPoints(model) {
    let start = model.get('attributes.start');
    let end = model.get('attributes.end');
    let increment = model.get('attributes.increment');
    if (Ember.isEmpty(start) || Ember.isEmpty(end) || Ember.isEmpty(increment)) {
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
    let type = model.get('attributes.type');
    if (Ember.isEqual(type, DISTRIBUTIONS.get('QUANTILE')) && (start < 0 || end > 1)) {
      return 'Quantiles requires that you specify a Start and End between 0 and 1';
    }
    let numberOfPoints = (end - start) / increment;
    return this.validateMaximumPoints(numberOfPoints, model);
  },

  validate(value, options, model) {
    let type = model.get('type');
    if (!Ember.isEqual(type, AGGREGATIONS.get('DISTRIBUTION'))) {
      return true;
    }
    let pointType = model.get('attributes.pointType');

    if (Ember.isEqual(pointType, DISTRIBUTION_POINTS.get('POINTS'))) {
      return this.validateFreeFormPoints(model);
    } else if (Ember.isEqual(pointType, DISTRIBUTION_POINTS.get('NUMBER'))) {
      return this.validateNumberOfPoints(model);
    } else if (Ember.isEqual(pointType, DISTRIBUTION_POINTS.get('GENERATED'))) {
      return this.validateGeneratedPoints(model);
    }
  }
});

Validoints.reopenClass({
  getDependentsFor() {
    return ['model.type', 'model.attributes.start', 'model.attributes.end', 'model.attributes.increment',
            'model.attributes.numberOfPoints', 'model.attributes.points', 'model.attributes.type', 'model.attributes.pointType'];
  }
});

export default Validoints;
