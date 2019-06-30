'use strict';

module.exports = {
  name: 'ember-poller',
  included: function(app) {
  	this._super.included.apply(this, arguments);
    app.import('node_modules/normalize.css/normalize.css');
  }
};
