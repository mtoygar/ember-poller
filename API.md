API
------------------------------------------------------------------------------

#### Classes
* [PollerService](#PollerService)
* [PollerUnit](#PollerUnit)

#### PollerService

##### `Methods`
* [track(options, ...pollingArgs)](#track)

##### `track`
Starts the polling and returns a [PollerUnit](#PollerUnit) instance. You can track the state of polling using the `PollerUnit` object and cancel the polling if necessary.

###### `Parameters`
| Name         | Type   | Description                        |
| -------      | ------ | ---------------------------------- |
| options      | Object | setup poller's properties          |
| pollingArgs* | *      | args to pass to the polling method |

The `options` parameter is used to configure polling. Allowed keys and default values are stated below. Note that either `pollTask` or `pollFunction` has to be present in the `options` object.

`pollingInterval`: elapsed time in ms between the completion of the last request and the next one. `default: 1500`

`retryLimit`: amount of retry attempt until timeout. `default: 40`

`pollTask`: the task that is to be performed on every polling attempt.

`pollFunction`: an async function that is to be called on every polling attempt.

#### PollerUnit

##### `Attributes`
* **isError** `:boolean` `readOnly`
  >true if polling is failed(an exception throwed or promise rejected), false otherwise.
* **isFailed** `:boolean` `readOnly`
  >alias of isError
* **isSuccessful** `:boolean` `readOnly`
  >true if polling is succeeded(a `truthy` value is returned), false otherwise.
* **isRunning** `:boolean` `readOnly`
  >true if polling is running, meaning it is not failed, succeeded, canceled or timed out.
* **isCanceled** `:boolean` `readOnly`
  >true if polling is canceled using [abort()](#abort) method.
* **isCancelled** `:boolean` `readOnly`
  >alias of isCanceled
* **isTimeout** `:boolean` `readOnly`
  >true if polling terminates without success, failure and cancellation.
* **retryCount** `:Number` `readOnly`
  >returns the number of pollings made since polling started.

##### `Methods`
* [abort()](#abort)

##### `abort`

Cancels the ongoing polling. Upon calling this method `isCancelled` attribute is set to true.
