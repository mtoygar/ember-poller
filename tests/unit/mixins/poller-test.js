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
  // POLL TASK

  test('it stops polling on success', async function(assert) {
    assert.expect(10);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollTask = task(function*() {
      assert.ok(true, 'pollTask is performed');
      return resolve(true);
    });

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign({}, TEST_POLLING_PROPERTIES, { pollTask }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isError'));
    assert.notOk(subject.get('isTimeout'));
    assert.notOk(subject.get('isCanceled'));
    assert.equal(subject.get('retryCount'), 1);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });

  test('it stops polling on error', async function(assert) {
    assert.expect(10);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollTask = task(function*() {
      assert.ok(true, 'pollTask is performed');
      return reject();
    });

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign({}, TEST_POLLING_PROPERTIES, { pollTask }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isError'));
    assert.notOk(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isTimeout'));
    assert.notOk(subject.get('isCanceled'));
    assert.equal(subject.get('retryCount'), 1);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });

  test('it tries polling until it succeeds', async function(assert) {
    assert.expect(9);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollTask = { perform: () => {} };
    const pollTaskStub = this.stub(pollTask, 'perform');

    pollTaskStub.onFirstCall().resolves(false);
    pollTaskStub.onSecondCall().resolves(false);
    pollTaskStub.onThirdCall().resolves(true);

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign({}, TEST_POLLING_PROPERTIES, { pollTask }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isError'));
    assert.notOk(subject.get('isTimeout'));
    assert.notOk(subject.get('isCanceled'));
    assert.equal(subject.get('retryCount'), 3);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });

  test('it tries polling until retryLimit', async function(assert) {
    assert.expect(9);

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
      subject.startPolling(assign({}, TEST_POLLING_PROPERTIES, { pollTask }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isTimeout'));
    assert.notOk(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isError'));
    assert.notOk(subject.get('isCanceled'));
    assert.equal(subject.get('retryCount'), 5);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });

  test('it cancels polling on demand', async function(assert) {
    assert.expect(6);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollTask = { perform: () => {} };
    const pollTaskStub = this.stub(pollTask, 'perform');

    pollTaskStub.resolves(false);

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign({}, TEST_POLLING_PROPERTIES, { pollTask }));
      subject.abort();
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isCanceled'));
    assert.notOk(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isError'));
    assert.notOk(subject.get('isTimeout'));
  });


  // POLL FUNCTION

  test('it stops polling on success for poll function', async function(assert) {
    assert.expect(10);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollFunction = function() {
      assert.ok(true, 'pollFunction is called');
      return resolve(true);
    };

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign({}, TEST_POLLING_PROPERTIES, { pollFunction }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isError'));
    assert.notOk(subject.get('isTimeout'));
    assert.notOk(subject.get('isCanceled'));
    assert.equal(subject.get('retryCount'), 1);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });

  test('it stops polling on error for poll function', async function(assert) {
    assert.expect(10);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollFunction = function() {
      assert.ok(true, 'pollFunction is called');
      return reject();
    };

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign({}, TEST_POLLING_PROPERTIES, { pollFunction }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isError'));
    assert.notOk(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isTimeout'));
    assert.notOk(subject.get('isCanceled'));
    assert.equal(subject.get('retryCount'), 1);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });

  test('it tries polling until it succeeds for poll function', async function(assert) {
    assert.expect(9);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollFunctionStub = this.stub();

    pollFunctionStub.onFirstCall().resolves(false);
    pollFunctionStub.onSecondCall().resolves(false);
    pollFunctionStub.onThirdCall().resolves(true);

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign({}, TEST_POLLING_PROPERTIES, { pollFunction: pollFunctionStub }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isError'));
    assert.notOk(subject.get('isTimeout'));
    assert.notOk(subject.get('isCanceled'));
    assert.equal(subject.get('retryCount'), 3);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });

  test('it tries polling until retryLimit for poll function', async function(assert) {
    assert.expect(9);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollFunctionStub = this.stub();

    pollFunctionStub.onCall(0).resolves(false);
    pollFunctionStub.onCall(1).resolves(false);
    pollFunctionStub.onCall(2).resolves(false);
    pollFunctionStub.onCall(3).resolves(false);
    pollFunctionStub.onCall(4).resolves(false);

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign({}, TEST_POLLING_PROPERTIES, { pollFunction: pollFunctionStub }));
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isTimeout'));
    assert.notOk(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isError'));
    assert.notOk(subject.get('isCanceled'));
    assert.equal(subject.get('retryCount'), 5);
    assert.equal(subject.get('retryLimit'), 5);
    assert.equal(subject.get('pollingInterval'), 10);
  });

  test('it cancels polling on demand for poll function', async function(assert) {
    assert.expect(6);

    let PollerObject = EmberObject.extend(PollerMixin);

    const pollFunctionStub = this.stub();

    pollFunctionStub.resolves(false);

    let subject = PollerObject.create();

    run(() => {
      subject.startPolling(assign({}, TEST_POLLING_PROPERTIES, { pollFunction: pollFunctionStub }));
      console.log(subject.abort());
    });

    await wait();

    assert.ok(subject);
    assert.ok(subject.get('isCanceled'));
    assert.notOk(subject.get('isSuccessful'));
    assert.notOk(subject.get('isRunning'));
    assert.notOk(subject.get('isError'));
    assert.notOk(subject.get('isTimeout'));
  });
});
