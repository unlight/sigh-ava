sigh-ava
--------

[![Greenkeeper badge](https://badges.greenkeeper.io/unlight/sigh-ava.svg)](https://greenkeeper.io/)
Adapt ava to work with sighjs.

### INSTALL
```js
npm install ava sigh-ava --save-dev
```

### EXAMPLE
```js
var merge, glob, concat, write, env, pipeline;
var ts;
var ava;

module.exports = function(pipelines) {

    pipelines["build"] = [
        glob({basePath: "src"}, "**/*.ts"),
        ts(),
        write("lib")
    ];
    
    pipelines["test"] = [
        ava({files: "test/*.js", source: "src/**/*.ts"})
    ];
};
```

### API
```js
ava(options)
```
Running sigh with option -w launches ava in watch mode (option `watch`).

### OPTIONS

* `files`  
Glob patterns for test files.  
Type: string  
Default: `test.js test-*.js`

* `source`  
Type: Array<string&gt;  
Pattern to match source files so tests can be re-run (Can be repeated)

See other options at [avajs/ava#cli](https://github.com/avajs/ava#cli)
