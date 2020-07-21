# \<paper-gauge\>

A simple svg powered ui gauge, or radial progress, Web Component.


These values are available for dynamic changes:

`radius`, `start`, `end`, `min`, `max` and `value`. 

However, `value` is the only animatable property.


## Example Usage

```
npm install --save @longlost/paper-gauge

or

yarn add @longlost/paper-gauge


// app.html

<style>
	
	paper-gauge {
  		--dial-width:  	8px;
  		--label-color: 	white;
  		--label-weight: normal;
  		--value-color: 	orange;
  		--value-width: 	8px;
	}	

</style>


<paper-gauge label value="75"></paper-gauge>




// app.js

import '@longlost/paper-gauge/paper-gauge.js';


const gauge = document.querySelector('paper-gauge');

gauge.max   = 50;
gauge.value = 20;


```


## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) and npm (packaged with [Node.js](https://nodejs.org)) installed. Run `npm install` to install your element's dependencies, then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.
