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
Poller service has a single method, namely `track`, which accepts a dictionary as below.

```
{
  pollingInterval: 1000, // elapsed time in ms between the completion of the last request and the next one. (default is 1500 ms)
  retryLimit: 30, // amount of retry atempt until timeout. (default is 40)
  pollTask: pollTask, // the task that is to be performed on every polling attempt.
}
```
An example usage of `track` method is as below.
```
import { reject } from 'rsvp';
import { task } from 'ember-concurrency';

poller: service(),
...

// Somewhere on the code call track method of the poller
let pollerUnit = this.get('poller').track({
  pollingInterval: 1000, // default is 1500 ms
  retryLimit: 30, // default is 40
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
}).restartable(),
```

Upon track call service returns a `pollerUnit`. It has the following properties;
```
{
  isSuccessful: // true if polling is ended with success.
  isError: // true if polling is ended with error.
  isRunning: // true if polling continues.
  isTimeout: // true if polling is ended with timeout.
}
```
On your templates you can access the polling state using `pollerUnit.isSuccessful`or using `this.get('pollerUnit.isSuccessful')` on your components or controllers.


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
