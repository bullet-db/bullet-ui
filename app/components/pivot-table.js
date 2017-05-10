import Ember from 'ember';

export default Ember.Component.extend({
  rows: null,
  columns: null,
  defaultRenderer: 'Table',

  didInsertElement() {
    this._super(...arguments);
    this.$('.pivot-table-container').pivotUI(this.get('rows'), {
      renderers: Ember.$.extend(
        Ember.$.pivotUtilities.renderers,
        Ember.$.pivotUtilities.c3_renderers
      )
    });
  }
});
