sigh-ava
--------
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
        write("lib"),
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
Type: Array  
Default: `['test.js', 'test-*.js', 'test/*.js']`

* `reporter`  
Type: Enum<string&gt;  
Default: verbose  
Type of reporter.  
Available options are: verbose, tap, mini. See [ava/lib/reporters](https://github.com/sindresorhus/ava/tree/master/lib/reporters).

* `source`  
Type: Array<string&gt;  
Pattern to match source files so tests can be re-run (Can be repeated)

See other options at [sindresorhus/ava#cli](https://github.com/sindresorhus/ava#cli)