/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { cancel, later } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  // Component API
  duration: 10000,
  active: false,
  updateInterval: 500,
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
  animationDuration: 800,
  useStep: true,

  // Private component configuration
  finished: undefined,
  startTime: null,
  endTime: null,
  runTime: null,
  percentNow: 0,
  futureTimer: null,
  timingDone: true,

  progress: computed('percentNow', 'timingDone', function() {
    return this.get('timingDone') ? 1 : this.get('percentNow');
  }).readOnly(),

  strokeColor: computed('timingDone', 'color', function() {
    return this.get('timingDone') ? this.get('doneColor') : this.get('color');
  }),

  options: computed('strokeWidth', 'strokeColor', 'trailColor', function() {
    let { strokeWidth, strokeColor, trailColor, easing, animationDuration, useStep }
      = this.getProperties('strokeWidth', 'strokeColor', 'trailColor', 'easing', 'animationDuration', 'useStep');

    let options = {
      strokeWidth,
      color: strokeColor,
      trailColor,
      easing,
      duration: animationDuration
    };
    if (useStep) {
      options.step = this.get('step');
    }
    return options;
  }).readOnly(),

  didReceiveAttrs() {
    this._super(...arguments);
    // Don't do any timing unless active. Also any changes with active true should restart timer.
    this.destroyTimer();
    if (this.get('active')) {
      this.startTiming();
    } else {
      this.destroyTimer();
    }
  },

  step(state, path) {
    let displayText = (path.value() * 100).toFixed(0);
    path.setText(`${displayText}%`);
  },

  destroyTimer() {
    // Docs say this should return false or undefined if it doesn't exist
    cancel(this.get('futureTimer'));
  },

  willDestroy() {
    this.destroyTimer();
  },

  startTiming() {
    let now = Date.now();
    let magnitude = parseFloat(this.get('duration'));
    magnitude = magnitude <= 0 ? 1 : magnitude;
    let end = new Date(now + magnitude).getTime();

    this.setProperties({
      startTime: now,
      endTime: end,
      duration: magnitude,
      runTime: end - now,
      percentNow: 0.0,
      timingDone: false,
      futureTimer: later(this, this.timer, this.get('updateInterval'))
    });
  },

  timer() {
    let timeNow = Date.now();
    let delta = (timeNow - this.get('startTime')) / this.get('runTime');
    this.set('percentNow', Math.min(delta, 1));
    if (timeNow >= this.get('endTime')) {
      this.sendAction('finished');
      return;
    }
    this.set('futureTimer', later(this, this.timer, this.get('updateInterval')));
  },

  actions: {
    onAnimationDone() {
      this.set('timingDone', true);
    }
  }
});
