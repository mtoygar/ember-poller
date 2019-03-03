import EmberObject from '@ember/object';
import PollerMixin from 'ember-poller/mixins/poller';
import { module } from 'qunit';
import test from 'ember-sinon-qunit/test-support/test';
import { run } from '@ember/runloop';
import { resolve, reject } from 'rsvp';
import { assign } from '@ember/polyfills';
import { task } from 'ember-concurrency';
import wait from 'ember-test-helpers/wait';

const TEST_POLLING_PROPERTIES = {
  pollingInterval: 10,
  retryLimit: 5,
  retryCount: 0,
};

module('Unit | Mixin | poller', function() {
  test('it stops polling on success', async function(assert) {
    assert.expect(9);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollTask = task(function*() {
      assert.ok(true, 'pollTask is performed');
      return resolve(true);
    });

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign(TEST_POLLING_PROPERTIES, { pollTask }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isError'));
    assert.notOk(subject.get('isTimeout'));
    assert.equal(subject.get('retryCount'), 1);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });

  test('it stops polling on error', async function(assert) {
    assert.expect(9);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollTask = task(function*() {
      assert.ok(true, 'pollTask is performed');
      return reject();
    });

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign(TEST_POLLING_PROPERTIES, { pollTask }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isError'));
    assert.notOk(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isTimeout'));
    assert.equal(subject.get('retryCount'), 1);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });

  test('it tries polling until it succeeds', async function(assert) {
    assert.expect(8);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollTask = { perform: () => {} };
    const pollTaskStub = this.stub(pollTask, 'perform');

    pollTaskStub.onFirstCall().resolves(false);
    pollTaskStub.onSecondCall().resolves(false);
    pollTaskStub.onThirdCall().resolves(true);

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign(TEST_POLLING_PROPERTIES, { pollTask }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isError'));
    assert.notOk(subject.get('isTimeout'));
    assert.equal(subject.get('retryCount'), 3);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });

  test('it tries polling until retryLimit', async function(assert) {
    assert.expect(8);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollTask = { perform: () => {} };
    const pollTaskStub = this.stub(pollTask, 'perform');

    pollTaskStub.onCall(0).resolves(false);
    pollTaskStub.onCall(1).resolves(false);
    pollTaskStub.onCall(2).resolves(false);
    pollTaskStub.onCall(3).resolves(false);
    pollTaskStub.onCall(4).resolves(false);

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign(TEST_POLLING_PROPERTIES, { pollTask }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isTimeout'));
    assert.notOk(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isError'));
    assert.equal(subject.get('retryCount'), 5);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });
});
