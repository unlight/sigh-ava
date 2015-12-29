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
	
	pipelines.explicit.ava = [
		ava(["tests/*.js"])
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
Optional: Yes  
Default: `['test.js', 'test-*.js', 'test/*.js']`

* `options`  
Options.  
Type: Object  
Optional: Yes  

    * `serial`  
    Type: Boolean  
    Default: false  
    Represents ava's `--serial` option (run tests serially).

    * `reporter`  
    Type: Enum<string&gt;  
    Default: verbose  
    Type of reporter.  
    Available options are: verbose, tap, mini. See [ava/lib/reporters](https://github.com/sindresorhus/ava/tree/master/lib/reporters).

    * `batch`  
    Type: Boolean  
    Default: true  
    If watch mode is enabled (`-w`), only last changed files will be passed to ava.
    In this case you need to define `glob` before `ava`:
    ```js
	pipelines['ava'] = [
		glob('tests/*.js'),
		ava([], {batch: true}),
	];
    ```
    But! There is an issue, glob will do unnecessary job by reading file content.

