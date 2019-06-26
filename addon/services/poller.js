import Service from '@ember/service';
import PollerMixin from 'ember-poller/mixins/poller';
import EmberObject from '@ember/object';

const PollUnit = EmberObject.extend(PollerMixin);

export { PollUnit };

export default Service.extend({
  track(options = {}, ...pollingArgs) {
    let pollUnit = PollUnit.create();
    pollUnit.startPolling(options, ...pollingArgs);
    return pollUnit;
  },
});
