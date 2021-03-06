import Service from '@ember/service';
import PollerMixin from 'ember-poller/mixins/poller';
import EmberObject from '@ember/object';
import { assign } from '@ember/polyfills';

const DEFAULT_STUBBED_SERVICE_PROPERTIES = {
  pollingInterval: 0,
};

const PollUnit = EmberObject.extend(PollerMixin, {
  startPolling: function(options, stubbedProps, ...pollingArgs) {
    this._super(
      assign({}, options, DEFAULT_STUBBED_SERVICE_PROPERTIES, stubbedProps),
      ...pollingArgs
    );
  },
});

export default function injectPoller(test, stubbedProps = {}) {
  let stubbedPoller = Service.extend({
    track(options = {}, ...pollingArgs) {
      let pollUnit = PollUnit.create();
      pollUnit.startPolling(options, stubbedProps, ...pollingArgs);
      return pollUnit;
    },
  });

  test.owner.register('service:poller', stubbedPoller);
}
