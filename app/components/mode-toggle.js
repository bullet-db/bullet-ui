/*
 *  Copyright 2017, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { not } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
  isToggled: true,
  notToggled: not('isToggled'),
  toggledText: 'Toggled',
  notToggledText: 'Not Toggled',

  actions: {
    toggle() {
      this.toggleProperty('isToggled');
      this.sendAction('onToggled', this.get('isToggled'));
    }
  }
});
