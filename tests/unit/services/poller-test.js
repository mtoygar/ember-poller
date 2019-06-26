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

    let pollUnitObject = EmberObject.create({ startPolling: () => {} });
    let pollingSpy = this.spy(pollUnitObject, 'startPolling');

    this.stub(PollUnit, 'create').callsFake(() => pollUnitObject);

    service.track('dummyArgs');

    assert.ok(pollingSpy.withArgs('dummyArgs'), 'startPolling called with proper arguments');
    assert.ok(pollingSpy.calledOnce, 'startPolling is called once');
  });

  test('it passes every arguments to poller mixin', async function(assert) {
    assert.expect(2);

    let service = this.owner.lookup('service:poller');

    let pollUnitObject = EmberObject.create({ startPolling: () => {} });
    let pollingSpy = this.spy(pollUnitObject, 'startPolling');

    this.stub(PollUnit, 'create').callsFake(() => pollUnitObject);

    const options = { dummyField: 'dummyField' };
    service.track(options, 1, 2, 3, 4);

    assert.ok(
      pollingSpy.withArgs(options, 1, 2, 3, 4),
      'startPolling should be called with proper arguments'
    );
    assert.ok(pollingSpy.calledOnce, 'startPolling is called once');
  });
});
