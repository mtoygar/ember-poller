ember-poller
==============================================================================

A polling addon for ember based on [ember-concurrency](https://github.com/machty/ember-concurrency)

What does it offer?
------------------------------------------------------------------------------
* Easy and handy polling state management
* Multiple and isolated polling support
* Automatic polling destruction upon destruction of the object that pollings live on
* Cancellable on demand
* A test helper to increase testibility

Installation
------------------------------------------------------------------------------

```bash
ember install ember-poller
```

API
------------------------------------------------------------------------------

#### Classes
* [PollerService](#PollerService)
* [PollerUnit](#PollerUnit)

#### PollerService

##### `Methods`
* [track(options, ...pollingArgs)](#track)

##### `track`
Starts the polling and returns a [PollerUnit](#PollerUnit) instance. You can track the state of polling using `PollerUnit` object and cancel the polling if necessary.

###### `Parameters`
| Name    | Type   | Description                        |
| ------- | ------ | ---------------------------------- |
| options | Object | setup poller's properties          |
| arg*    | *      | args to pass to the polling method |

Options parameter is used to configure polling. Allowed keys and default values are stated below. Note that either `pollTask` or `pollFunction` has to be present in the `options` object.

`pollingInterval`: elapsed time in ms between the completion of the last request and the next one. `default: 1500`

`retryLimit`: amount of retry attempt until timeout. `default: 40`

`pollTask`: the task that is to be performed on every polling attempt.

`pollFunction`: an async function that is to be called on every polling attempt.

#### PollerUnit

##### `Attributes`
* **isError** `:boolean` `readOnly`
  >true if polling is failed(an exception throwed or promise rejected), false otherwise.
* **isSuccessful** `:boolean` `readOnly`
  >true if polling is succeeded(a `truthy` value is returned), false otherwise.
* **isRunning** `:boolean` `readOnly`
  >true if polling is running, meaning it is not failed, succeeded, cancelled or timed out.
* **isCancelled** `:boolean` `readOnly`
  >true if polling is cancelled using [abort()](#abort) method.
* **isCanceled** `:boolean` `readOnly`
  >alias for isCancelled
* **isTimeout** `:boolean` `readOnly`
  >true if polling terminates without success, failure and cancellation.
* **retryCount** `:Number` `readOnly`
  >returns the number of pollings made since polling started.

##### `Methods`
* [abort()](#abort)

##### `abort`

Cancels the ongoing polling. Upon calling this method `isCancelled` attribute is set to true.

SAMPLE USAGES
------------------------------------------------------------------------------

<details open>
  <summary>track with pollTask</summary>

An example usage of `track` method is as below.
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
    return reject(); // if you have an error case basicly reject the promise
  }
  // if polling needs to continue basicly do nothing.
})
```
</details>

<details>
  <summary>track with async function</summary>

If you don't use ember-concurrency on your project, you can provide an async function as a polling method. An example is provided below.

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
    return reject(); // if you have an error case basicly reject the promise
  }
  // if polling needs to continue basicly do nothing.
}
```
</details>

<details>
  <summary>track with polling arguments</summary>
Arguments other than option parameter will be passed directly to your pollingTask or pollingFunction.

An example usage can be found below.
```javascript
import { reject } from 'rsvp';
import { task } from 'ember-concurrency';

poller: service(),

// Somewhere on the code call track method of the poller
let pollerUnit = this.get('poller').track({
  pollingInterval: 1000,
  retryLimit: 30,
  pollTask: this.get('pollTask'),
}, 10, 90);
this.set('pollerUnit', pollerUnit);


pollTask: task(function*(min, max) {
  let response = yield this.get('someModel').reload();
  if (response == 'error') {
    return reject(); // if you have an error case basicly reject the promise
  } else if {
    return true; // if your task succeeds return true, so that poller service understands the task is successfully completed
  }
  // if polling needs to continue basicly do nothing.
})
```
</details>

<details>
  <summary>cancel polling</summary>

```javascript
let pollerUnit = this.get('poller').track({ pollTask: this.get('pollTask') });
pollerUnit.abort(); // cancels the polling
pollerUnit.isCancelled; // returns true.
```
</details>


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

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone git@github.com:mtoygar/ember-poller.git`
* `cd ember-poller`
* `yarn install`

### Linting

* `npm run prettier`

### Running tests

* `ember test` – Runs the test suite on the current Ember version

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4204).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
