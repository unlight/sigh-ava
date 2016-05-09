"use strict";

var arrify = require("arrify");
var log = require("sigh-core").log;
var Bacon = require("sigh-core").Bacon;
var Api = require("ava/api");
var Reporter = require("ava/lib/reporters/verbose");
var Logger = require("ava/lib/logger");
var EventEmitter = require("events").EventEmitter;

var defaults = {
	reporter: "verbose"
};

module.exports = function(op, options) {

	options = Object.assign({}, defaults, options || {});
	var files = arrify(options.files);
	
	var api = new Api(options);
	
	try {
		Reporter = require("ava/lib/reporters/" + options.reporter);
	} catch (e) {
		log("Invalid option reporter (" + options.reporter + "), using default (verbose)");
	}

	var reporter = Reporter();
	reporter.api = api;
	var logger = new Logger(reporter);
	
	logger.start();
	
	api.on("test", logger.test);
	api.on("error", logger.unhandledError);
	api.on("stdout", logger.stdout);
	api.on("stderr", logger.stderr);

	function run() {
		return api.run(files)
			.then(function () {
				logger.finish();
				var failCount = api.failCount + api.rejectionCount + api.exceptionCount;
				return failCount;
			})
			.catch(function (err) {
				setImmediate(function () {
					throw err;
				});
			});
	}

	function failCountHandler(failCount) {
		return failCount > 0 ? new Bacon.Error("ava: " + failCount + " test(s) failed") : [];
	}

	var stream = op.stream.flatMapLatest(function(events) {
		return Bacon.fromPromise(run().then(failCountHandler));
	});

	if (op.watch) {
		var updater = new EventEmitter();
		var Watcher = require("ava/lib/watcher");
		var watcher = new Watcher(logger, api, files, arrify(options.source));
		api.on("ready", function() {
			watcher.busy.then(function() {
				updater.emit("data", api.errors);
			});
		});
		stream = Bacon.fromEvent(updater, "data", function(errors) {
			return failCountHandler(errors.length);
		});
		// var old = watcher.emit;
		// watcher.emit = function(n) {
		// 	debugger;
		// 	// console.log('watcher.n ' , n);
		// 	return old.apply(watcher, arguments);
		// };
		// var old1 = api.emit;
		// api.emit = function(n) {
		// 	debugger;
		// 	return old1.apply(api, arguments);
		// };
		
		// var old2 = watcher.busy.emit;
		// watcher.busy.emit = function(n) {
		// 	debugger;
		// 	console.log('watcher.busy.n ' , n);
		// 	return old2.apply(watcher.busy, arguments);
		// };

		// // this.busy
		// process.stdin.on("data", function (data) {
		// 	console.log('data ' , data);
		// 	// data = data.trim().toLowerCase();
		// 	// if (data !== 'r' && data !== 'rs') {
		// 	// 	return;
		// 	// }
		// 	debugger;
		// });
		// try {
			
		// 	watcher.observeStdin();
		// } catch (err) {
		// 	if (err.name === "AvaError") {
		// 		// An AvaError may be thrown if chokidar is not installed. Log it nicely.
		// 		console.log('  ' + colors.error(figures.cross) + ' ' + err.message);
		// 		logger.exit(1);
		// 	} else {
		// 		// Rethrow so it becomes an uncaught exception.
		// 		throw err;
		// 	}
		// }
		// stream = stream.take(1).concat(Bacon.fromEvent(updater, "data"));
	}

	return stream;
};