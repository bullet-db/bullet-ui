/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export default Ember.Component.extend({
  duration: 10000,
  active: false,
  updateInterval: 500,
  finished: undefined,
  startTime: null,
  endTime: null,
  runTime: null,
  percentNow: 0,
  futureTimer: null,

  progressWidth: Ember.computed('percentNow', function() {
    let percent = this.get('percentNow');
    return Ember.String.htmlSafe(`width: ${percent}%`);
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    // Don't do any timing unless active. Also any changes with active true should restart timer.
    if (this.get('active')) {
      this.destroyTimer();
      this.startTiming();
    }
  },

  destroyTimer() {
    // Docs say this should return false or undefined if it doesn't exist
    Ember.run.cancel(this.get('futureTimer'));
  },

  willDestroy() {
    this.destroyTimer();
  },

  startTiming() {
    let now = Date.now();
    let magnitude = parseFloat(this.get('duration'));
    magnitude = magnitude <= 0 ? 100 : magnitude;
    let end = new Date(now + magnitude).getTime();

    this.setProperties({
      startTime: now,
      endTime: end,
      duration: magnitude,
      runTime: end - now,
      futureTimer: Ember.run.later(this, this.timer, this.get('updateInterval'))
    });
  },

  timer() {
    let timeNow = Date.now();
    let delta = (timeNow - this.get('startTime')) / this.get('runTime');
    this.set('percentNow', Math.min(Math.floor(100 * delta), 100));
    if (timeNow >= this.get('endTime')) {
      this.set('timingDone', true);
      this.sendAction('finished');
      return;
    }
    this.set('futureTimer', Ember.run.later(this, this.timer, this.get('updateInterval')));
  }
});
