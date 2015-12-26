# sigh-ava
Adapt ava to work with sighjs

INSTALL
-------
```js
npm install ava sigh-ava --save-dev
```

EXAMPLE USAGE
-------------
```js
var merge, glob, concat, write, env, pipeline;
var ava;

module.exports = function(pipelines) {

	pipelines["test"] = [
		// glob("test/*.js"),
		pipeline({ activate: true }, "ava")
	];
	
	pipelines.explicit.ava = [
		ava(["tests/*.js"], {
			reporter: {"verbose"}
			serial: false
		})
	]; 
};
```

API
---
```js
ava(files, options)
```

* `files`  
Glob patterns for test files.  
Type: Array  
Optional: Yes (default: `['test.js', 'test-*.js', 'test/*.js']`)

* `options`  
Options.  
Type: Object  
Optional: Yes  

    * `serial` (boolean)  
    Represents ava's `--serial` option (run tests serially).

    * `reporter` (enum<string&gt;)
    Type of reporter. Available options are: verbose (default), tap, mini. See [ava/lib/reporters](https://github.com/sindresorhus/ava/tree/master/lib/reporters).
