ember-poller
==============================================================================

A polling addon for ember based on [ember-concurrency](https://github.com/machty/ember-concurrency)

Installation
------------------------------------------------------------------------------

```bash
ember install ember-poller
```

API
------------------------------------------------------------------------------
* [track(options)](#track)
* [abort()](#abort)

##### `track`
##### - track with pollTask

An example usage of `track` method is as below.
```javascript
import { reject } from 'rsvp';
import { task } from 'ember-concurrency';

poller: service(),

// Somewhere on the code call track method of the poller
let pollerUnit = this.get('poller').track({
  pollingInterval: 1000, // elapsed time in ms between the completion of the last request and the next one. (default is 1500 ms)
  retryLimit: 30, // amount of retry atempt until timeout. (default is 40)
  pollTask: this.get('pollTask'), // the task that is to be performed on every polling attempt.
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
}).restartable(),
```

Upon track call service returns a `pollerUnit`. It has the following properties;
```javascript
{
  isSuccessful: // true if polling is ended with success.
  isError: // true if polling is ended with error.
  isRunning: // true if polling continues.
  isTimeout: // true if polling is ended with timeout.
  isCanceled: // true if polling is canceled.
}
```
On your templates you can access the polling state using `pollerUnit.isSuccessful`or using `this.get('pollerUnit.isSuccessful')` on your components or controllers.

##### - track with async function
If you do not use ember-concurrency on your project, you can provide an async function as an option. An example is provided below.

```javascript
import { reject } from 'rsvp';

poller: service(),

// Somewhere on the code call track method of the poller
let pollerUnit = this.get('poller').track({
  pollingInterval: 1000, // elapsed time in ms between the completion of the last request and the next one. (default is 1500 ms)
  retryLimit: 30, // amount of retry atempt until timeout. (default is 40)
  pollingFunction: () => this.pollingFunction(), // you need to pass pollingFunction as an arrow function. This ensures that `this` inside `pollingFunction` is the enclosing scope.
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
},
```
Upon track call service returns a `pollerUnit`. It has the following properties;
```javascript
{
  isSuccessful: // true if polling is ended with success.
  isError: // true if polling is ended with error.
  isRunning: // true if polling continues.
  isTimeout: // true if polling is ended with timeout.
  isCanceled: // true if polling is canceled.
}
```
On your templates you can access the polling state using `pollerUnit.isSuccessful`or using `this.get('pollerUnit.isSuccessful')` on your components or controllers.

##### `abort`

  - For dealing with stopping the polling. It should be called on pollerUnit, not directly on poller service.

```javascript
let pollerUnit = this.get('poller').track({ pollTask: this.get('pollTask') });
pollerUnit.abort(); // cancels the polling
```

Testing
------------------------------------------------------------------------------
You can stub track method in your tests in your acceptance and integration tests.
```javascript
let pollerService = this.owner.lookup('service:poller');
this.stub(pollerService, 'track').returns({ isRunning: true }); // sinon implementation
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
