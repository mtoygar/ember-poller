import Mixin from '@ember/object/mixin';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { assign } from '@ember/polyfills';

const DEFAULT_POLLING_PROPERTIES = {
  pollingInterval: 1000, //time in ms between the completion of the last request and the next one.
  retryLimit: 40,
  retryCount: 0,
};

export default Mixin.create({
  isError: alias('pollingTaskInstance.isError'),
  isRunning: alias('pollingTaskInstance.isRunning'),
  isCanceled: alias('pollingTaskInstance.isCanceled'),
  isCancelled: alias('isCanceled'),
  isTimeout: false,

  isSuccessful: computed('pollingTaskInstance.isSuccessful', 'isTimeout', function() {
    return this.get('pollingTaskInstance.isSuccessful') && !this.get('isTimeout');
  }),

  startPolling(options, ...pollingArgs) {
    this.setProperties(assign({}, DEFAULT_POLLING_PROPERTIES, options));
    let pollingTaskInstance = this.get('pollingTask').perform(...pollingArgs);
    this.set('pollingTaskInstance', pollingTaskInstance);
  },

  abort() {
    this.get('pollingTaskInstance').cancel();
  },

  pollingTask: task(function*(...pollingArgs) {
    while (this.get('retryCount') < this.get('retryLimit')) {
      this.incrementProperty('retryCount');
      if (yield this.poll(...pollingArgs)) {
        return;
      }
      yield timeout(this.get('pollingInterval'));
    }
    this.set('isTimeout', true);
  }).drop(),

  poll(...pollingArgs) {
    if (this.get('pollTask')){
      return this.get('pollTask').perform(...pollingArgs);
    }
    else if (this.get('pollFunction')){
      return this.pollFunction(...pollingArgs);
    }
  },
});
