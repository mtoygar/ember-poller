[![Build Status](https://travis-ci.com/mtoygar/ember-poller.svg?branch=master)](https://travis-ci.com/mtoygar/ember-poller)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ember-poller
==============================================================================

A polling addon for ember based on [ember-concurrency](https://github.com/machty/ember-concurrency)

What does it offer?
------------------------------------------------------------------------------
* Easy and handy polling state management
* Multiple and isolated polling support
* Automatic polling destruction upon the destruction of the object that pollings live on
* Cancellable on demand
* A test helper to increase testability

Installation
------------------------------------------------------------------------------

```bash
ember install ember-poller
```

Sample Usages
------------------------------------------------------------------------------

You can initiate the poller using a ember-concurrency task.

```javascript
import { reject } from 'rsvp';
import { task } from 'ember-concurrency';

poller: service(),

// Somewhere on the code call track method of the poller
let pollerUnit = this.get('poller').track({
  pollingInterval: 1000,
  retryLimit: 30,
  pollTask: this.get('pollTask'),
});
this.set('pollerUnit', pollerUnit);


pollTask: task(function*() {
  let response = yield this.get('someModel').reload();
  if (response.status == 'done') {
    return true; // if your task succeeds return true, so that poller service understands the task is successfully completed
  } else if (response == 'error') {
    return reject(); // if you have an error case basically reject the promise
  }
  // if polling needs to continue basically do nothing.
})
```

If you don't use ember-concurrency on your project, you can also provide an async function as a polling method.

```javascript
import { reject } from 'rsvp';

poller: service(),

// Somewhere on the code call track method of the poller
let pollerUnit = this.get('poller').track({
  pollingInterval: 1000,
  retryLimit: 30,
  pollingFunction: () => this.pollingFunction(),
});
this.set('pollerUnit', pollerUnit);


async pollingFunction() {
  let response = await this.get('someModel').reload();
  if (response.status == 'done') {
    return true; // if your task succeeds return true, so that poller service understands the task is successfully completed
  } else if (response == 'error') {
    return reject(); // if you have an error case basically reject the promise
  }
  // if polling needs to continue basically do nothing.
}
```

Arguments other than option parameter will be passed directly to your pollingTask or pollingFunction.

```javascript
import { reject } from 'rsvp';
import { task } from 'ember-concurrency';

poller: service(),

// Somewhere on the code call track method of the poller
let pollerUnit = this.get('poller').track({
  pollingInterval: 1000,
  retryLimit: 30,
  pollTask: this.get('pollTask'),
}, 17, 89);
this.set('pollerUnit', pollerUnit);


pollTask: task(function*(min, max) {
  let response = yield this.get('someModel').reload();
  console.log(min); // 17
  console.log(max); // 89
  if (response == 'error') {
    return reject(); // if you have an error case basically reject the promise
  } else if (response.get('anAttribute') > min && response.get('anAttribute') < max) {
    return true; // if your task succeeds return true, so that poller service understands the task is successfully completed
  }
  // if polling needs to continue basically do nothing.
})
```

You can also cancel polling using the `abort` method.

```javascript
let pollerUnit = this.get('poller').track({ pollTask: this.get('pollTask') });
pollerUnit.abort(); // cancels the polling
pollerUnit.isCancelled; // returns true.
```

You can track the state of the polling with the attributes of PollerUnit.

```javascript
pollerUnit.get('isError'); // true if polling is failed(an exception throwed or promise rejected), false otherwise.
pollerUnit.get('isFailed'); // alias of isError
pollerUnit.get('isSuccessful'); // true if polling is succeeded(a `truthy` value is returned), false otherwise.
pollerUnit.get('isRunning'); // true if polling is running, meaning it is not failed, succeeded, canceled or timed out.
pollerUnit.get('isCanceled'); // true if polling is canceled using [abort()](#abort) method.
pollerUnit.get('isCancelled'); // alias of isCanceled
pollerUnit.get('isTimeout'); // true if polling terminates without success, failure and cancellation.
pollerUnit.get('retryCount'); // returns the number of pollings made since polling started.
````

For further reference, you may look [API](https://github.com/mtoygar/ember-poller/blob/master/README.md) docs.

Testing
------------------------------------------------------------------------------
You can stub track method in your tests in your acceptance and integration tests.
```javascript
let pollerService = this.owner.lookup('service:poller');
this.stub(pollerService, 'track').returns({ isRunning: true }); // sinon implementation
```

#### Test Helper
You can also inject a stubbed poller to your tests and set the pollingInterval to zero. To test your success, error, timeout case all you need is to arrange your data/mocks as intended. An example can be found below.

```javascript
import injectPoller from 'ember-poller/test-helpers/poller-stub';

test('it supports polling methods with arguments', async function(assert) {
  assert.expect(5);

  injectPoller(this);
  // Arrange
  // Act
  // Assert
});
```

Optionally, you can also pass `stubbedOptions` to `injectPoller`. This will override your parameters specified in your code.
```javascript
import injectPoller from 'ember-poller/test-helpers/poller-stub';

test('it supports polling methods with arguments', async function(assert) {
  assert.expect(5);

  injectPoller(this, {
    pollingInterval: 10,
    retryLimit: 5,
  });
  // Arrange
  // Act
  // Assert
});
```
