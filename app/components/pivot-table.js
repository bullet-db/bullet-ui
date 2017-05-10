import Ember from 'ember';

export default Ember.Component.extend({
  rows: null,
  columns: null,
  initialOptions: null,
  defaultOptions: {
    unusedAttrsVertical: true,
    menuLimit: 200,
    renderers: Ember.$.extend(
      Ember.$.pivotUtilities.renderers,
      Ember.$.pivotUtilities.c3_renderers
    )
  },

  options: Ember.computed('initialOptions', 'defaultOptions', function() {
    let deserialized = this.get('initialOptions');
    let options = this.get('defaultOptions');
    // Attach refresh handler
    return Ember.$.extend({ onRefresh: this.refreshHandler(this) }, deserialized, options);
  }),

  didInsertElement() {
    this._super(...arguments);
    let { rows, options } = this.getProperties('rows', 'options');
    this.$('.pivot-table-container').pivotUI(rows, options);
  },

  refreshHandler(context) {
    return (configuration) => {
      let copy = JSON.parse(JSON.stringify(configuration));
      // Deletes functions and defaults: http://nicolas.kruchten.com/pivottable/examples/onrefresh.html
      delete copy.aggregators;
      delete copy.renderers;
      delete copy.rendererOptions;
      delete copy.localeStrings;
      context.sendAction('onRefresh', copy);
    };
  }
});
