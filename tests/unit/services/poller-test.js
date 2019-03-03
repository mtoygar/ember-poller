import { module } from 'qunit';
import { setupTest } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import { PollUnit } from 'ember-poller/services/poller';
import EmberObject from '@ember/object';

module('Unit | Service | poller', function(hooks) {
  setupTest(hooks);

  test('it creates an instance of poller mixin', async function(assert) {
    assert.expect(2);

    let service = this.owner.lookup('service:poller');

    let pollUnitObject = EmberObject.create({
      startPolling: function() {
        assert.ok(true);
        return true;
      },
    });

    let pollingSpy = this.spy(pollUnitObject, 'startPolling');

    // stub PollUnit class
    this.stub(PollUnit, 'create').callsFake(() => pollUnitObject);

    service.track('dummyArgs');

    assert.ok(
      pollingSpy.withArgs('dummyArgs').calledOnce,
      'startPolling should be called with proper arguments'
    );
  });
});
