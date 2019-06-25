import { module } from 'qunit';
import { setupTest } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import injectPoller from 'ember-poller/test-helpers/poller-stub';
import { task } from 'ember-concurrency';
import { reject } from 'rsvp';
import { run } from '@ember/runloop';
import wait from 'ember-test-helpers/wait';

module('Unit | TestHelper | poller-stub', function(hooks) {
  setupTest(hooks);

  test('it overrides pollers pollingInterval as zero', async function(assert) {
    assert.expect(1);

    injectPoller(this);

    let service = this.owner.lookup('service:poller');

    let pollerUnit = service.track({
      pollingInterval: 1000,
      retryLimit: 5,
      pollTask: task(function*() {}),
    });

    await wait();

    assert.equal(pollerUnit.pollingInterval, 0, 'overrides pollingInterval to zero');
  });

  test('it overrides original service props if overrided props are given', async function(assert) {
    assert.expect(1);

    const overridedRetryLimit = 10;

    const overridedPollTask = { perform: () => {} };
    const overridedPollTaskStub = this.stub(overridedPollTask, 'perform');

    injectPoller(this, {
      retryLimit: overridedRetryLimit,
      pollTask: overridedPollTask,
    });

    let service = this.owner.lookup('service:poller');

    service.track({
      pollingInterval: 1000,
      retryLimit: 1000,
      pollTask: task(function*() {}),
    });

    await wait();

    assert.equal(overridedPollTaskStub.callCount, overridedRetryLimit);
  });

  test('it stubs async functions as well', async function(assert) {
    assert.expect(1);

    injectPoller(this);

    let service = this.owner.lookup('service:poller');

    let pollFunction = this.stub();

    service.track({
      pollingInterval: 1000,
      retryLimit: 5,
      pollFunction,
    });

    await wait();

    assert.ok(pollFunction.callCount, 5)
  });

  test('it stops polling on timeout', async function(assert) {
    assert.expect(2);

    injectPoller(this);

    let service = this.owner.lookup('service:poller');

    let pollerUnit = service.track({
      pollingInterval: 1000,
      retryLimit: 5,
      pollFunction: () => {},
    });

    await wait();

    assert.ok(pollerUnit.isTimeout);
    assert.equal(pollerUnit.retryCount, 5);
  });

  test('it stops polling on success', async function(assert) {
    assert.expect(2);

    injectPoller(this);

    let service = this.owner.lookup('service:poller');

    let pollFunction = this.stub();

    pollFunction.onCall(0).resolves(false);
    pollFunction.onCall(1).resolves(false);
    pollFunction.onCall(2).resolves(true);

    let pollerUnit = service.track({
      pollingInterval: 1000,
      retryLimit: 5,
      pollFunction,
    });

    await wait();

    assert.ok(pollerUnit.isSuccessful);
    assert.equal(pollerUnit.retryCount, 3);
  });

  test('it stops polling on fail', async function(assert) {
    assert.expect(2);

    injectPoller(this);

    let service = this.owner.lookup('service:poller');

    let pollFunction = this.stub();

    pollFunction.onCall(0).resolves(false);
    pollFunction.onCall(1).resolves(false);
    pollFunction.onCall(2).returns(reject());

    let pollerUnit = service.track({
      pollingInterval: 1000,
      retryLimit: 5,
      pollFunction,
    });

    await wait();

    assert.ok(pollerUnit.isError);
    assert.equal(pollerUnit.retryCount, 3);
  });

  test('it stops polling on abort', async function(assert) {
    assert.expect(1);

    injectPoller(this);

    let service = this.owner.lookup('service:poller');

    let pollerUnit = service.track({
      pollFunction: async () => {},
    });

    run(() => {
      pollerUnit.abort();
    });

    await wait();

    assert.ok(pollerUnit.isCancelled);
  });
});
