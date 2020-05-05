/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { cancel, later } from '@ember/runloop';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  // Component API
  duration: 10000,
  active: false,
  updateInterval: 200,
  // The value doesn't matter. Using this as a 'observer' to trigger timing again.
  retriggerOnChangeIn: null,

  // Ember Progress Bar configuration
  shape: 'Circle',
  strokeWidth: 8.0,
  color: '#555',
  doneColor: '#21D87D',
  trailColor: '#eee',
  // https://github.com/jeremyckahn/shifty/blob/e13d78f887b3783b6d93e501d26cc37a9fa2d206/src/easing-functions.js
  easing: 'linear',
  animationDuration: 200,
  useStep: true,

  // Private component configuration
  finished: undefined,
  startTime: null,
  endTime: null,
  runTime: null,
  percentNow: 0,
  futureTimer: null,
  timingDone: true,

  showDone: computed('timingDone', 'active', function() {
    return this.timingDone || !this.active;
  }).readOnly(),

  progress: computed('percentNow', 'timingDone', function() {
    // Deliberately based on timingDone instead of showDone to show the progress percent at which the query became done
    return this.timingDone ? 1 : this.percentNow;
  }).readOnly(),

  strokeColor: computed('showDone', 'color', function() {
    return this.showDone ? this.doneColor : this.color;
  }),

  options: computed('strokeWidth', 'strokeColor', 'trailColor', function() {
    let { strokeWidth, strokeColor, trailColor, easing, animationDuration, useStep }
      = this;

    let options = {
      strokeWidth,
      color: strokeColor,
      trailColor,
      easing,
      duration: animationDuration
    };
    if (useStep) {
      options.step = this.step;
    }
    return options;
  }).readOnly(),

  didReceiveAttrs() {
    this._super(...arguments);
    this.destroyTimer();
    // Don't do any timing unless active. Also any changes with active true should restart timer.
    if (this.active) {
      this.startTiming();
    }
  },

  step(state, path) {
    let displayText = (path.value() * 100).toFixed(0);
    path.setText(`${displayText}%`);
  },

  destroyTimer() {
    // Docs say this should return false or undefined if it doesn't exist
    cancel(this.futureTimer);
  },

  willDestroy() {
    this.destroyTimer();
  },

  startTiming() {
    let now = Date.now();
    let magnitude = parseFloat(this.duration);
    magnitude = magnitude <= 0 ? 1 : magnitude;
    let end = new Date(now + magnitude).getTime();

    this.setProperties({
      startTime: now,
      endTime: end,
      duration: magnitude,
      runTime: end - now,
      percentNow: 0.0,
      timingDone: false,
      futureTimer: later(this, this.timer, this.updateInterval)
    });
  },

  timer() {
    let timeNow = Date.now();
    let delta = (timeNow - this.startTime) / this.runTime;
    this.set('percentNow', Math.min(delta, 1));
    if (timeNow >= this.endTime) {
      this.set('timingDone', true);
      this.sendAction('finished');
      return;
    }
    this.set('futureTimer', later(this, this.timer, this.updateInterval));
  }
});
