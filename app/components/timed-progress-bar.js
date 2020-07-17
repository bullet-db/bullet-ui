/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';
import { not, or } from '@ember/object/computed';
import { cancel, later } from '@ember/runloop';
import argsGet from 'bullet-ui/utils/args-get';

export default class TimedProgressBarComponent extends Component {
  updateInterval = 200;
  finished;
  startTime;
  endTime;
  runTime;
  percentNow = 0;
  futureTimer;
  timingDone = true;

  // Ember Progress Bar constants
  strokeWidth = 8.0;
  color = '#555';
  doneColor = '#21D87D';
  trailColor = '#eee';
  // https://github.com/jeremyckahn/shifty/blob/e13d78f887b3783b6d93e501d26cc37a9fa2d206/src/easing-functions.js
  easing = 'linear';
  animationDuration = 200;

  @not('args.isActive') isNotActive;
  @or('timingDone', 'isNotActive') showDone;

  get shape() {
    return argsGet('shape') || 'Circle';
  }

  get useStep() {
    return argsGet('useStep') || true;
  }

  get progress() {
    // Deliberately based on timingDone instead of showDone to show the progress percent at which the query became done
    return this.timingDone ? 1 : this.percentNow;
  }

  get strokeColor() {
    return this.showDone ? this.doneColor : this.color;
  }

  get options() {
    let { strokeWidth, strokeColor, trailColor, easing, animationDuration, useStep } = this;
    let options = {
      strokeWidth,
      color: strokeColor,
      trailColor,
      easing,
      duration: animationDuration
    };
    if (useStep) {
      // Pass in the whole function
      options.step = this.step;
    }
    return options;
  }

  willDestroy() {
    this.stopTiming();
  }

  step(state, path) {
    let displayText = (path.value() * 100).toFixed(0);
    path.setText(`${displayText}%`);
  }

  startTiming() {
    let now = Date.now();
    let magnitude = parseFloat(this.duration);
    magnitude = magnitude <= 0 ? 1 : magnitude;
    let end = new Date(now + magnitude).getTime();
    this.startTime = now;
    this.endTime = end;
    this.duration = magnitude;
    this.runTime = end - now;
    this.percentNow = 0.0;
    this.timingDone = false;
    this.futureTimer = later(this, this.timer, this.updateInterval);
  }

  stopTiming() {
    // Docs say this should return false or undefined if it doesn't exist
    cancel(this.futureTimer);
  }

  timer() {
    let timeNow = Date.now();
    let delta = (timeNow - this.startTime) / this.runTime;
    this.percentNow = Math.min(delta, 1);
    if (timeNow >= this.endTime) {
      this.timingDone = true;
    } else {
      this.futureTimer = later(this, this.timer, this.updateInterval);
    }
  }

  @action
  restartTimer() {
    this.stopTiming();
    if (this.active) {
      this.startTiming();
    }
  }
}
