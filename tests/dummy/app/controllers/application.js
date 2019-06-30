import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { A } from '@ember/array';
import { reject } from 'rsvp';

const DEFAULT_POLLING_PROPS = {
  pollingInterval: 750,
  retryLimit: 20,
  errorProbability: 5,
  successProbability: 5,
};

const SCALE = 100;

export default Controller.extend({
  poller: service(),

  pollerUnits: A(),
  pollingInterval: DEFAULT_POLLING_PROPS.pollingInterval,
  retryLimit: DEFAULT_POLLING_PROPS.retryLimit,
  successProbability: DEFAULT_POLLING_PROPS.successProbability,
  errorProbability: DEFAULT_POLLING_PROPS.errorProbability,

  pollDownloadLinkTask: task(function*(errorProbability, successProbability) {
    const random = Math.random() * SCALE;

    if (random < errorProbability) {
      return reject();
    } else if (random < successProbability) {
      return true;
    }
  }).restartable(),

  actions: {
    poll: function(){
      let pollerUnit = this.get('poller').track({
        pollingInterval: this.get('pollingInterval'),
        retryLimit: this.get('retryLimit'),
        pollTask: this.get('pollDownloadLinkTask'),
      }, this.get('errorProbability'), this.get('successProbability'));
      this.get('pollerUnits').pushObject(pollerUnit);
    },

    abortPoll: function(pollerUnit){
      pollerUnit.abort();
    },

    clearTable: function(){
      this.get('pollerUnits').clear();
    },

    setSuccessProbability: function(value){
      this.set('successProbability', parseInt(value));
      if (this.get('successProbability') + this.get('errorProbability') > SCALE) {
        this.set('errorProbability', SCALE - this.get('successProbability'));
      }
    },

    setErrorProbability: function(value){
      this.set('errorProbability', parseInt(value));
      if (this.get('errorProbability') + this.get('successProbability') > SCALE) {
        this.set('successProbability', SCALE - this.get('errorProbability'));
      }
    },
  },
});
