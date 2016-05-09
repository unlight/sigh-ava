"use strict";

var log = require("sigh-core").log;
var Bacon = require("sigh-core").Bacon;
var Api = require("ava/api");
var Reporter = require("ava/lib/reporters/verbose");
var Logger = require("ava/lib/logger");

var defaults = {
	serial: false,
	reporter: "verbose",
	batch: false
};

module.exports = function(op, files, options) {

	var isWatchMode = op.watch;
	options = Object.assign({}, defaults, options || {});
	

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
	api.on('test', logger.test);
	api.on('error', logger.unhandledError);
	api.on('stdout', logger.stdout);
	api.on('stderr', logger.stderr);

	var avaProc = function() {
		console.log('files ' , files);
		return api.run(files)
			.then(function () {
				logger.finish();
				var failCount = api.failCount + api.rejectionCount + api.exceptionCount;
				if (!isWatchMode) {
					logger.exit(failCount > 0 ? 1 : 0);
				}
				return failCount;
			})
			.catch(function (err) {
				// console.error(err.stack); // eslint-disable-line no-console
				// logger.exit(1);
				// return err;
				// Don't swallow exceptions. Note that any expected error should already
				// have been logged.
				setImmediate(function () {
					throw err;
				});
			});
	};

	// try {
	// 	var watcher = new Watcher(logger, api, files, arrify(cli.flags.source));
	// 	watcher.observeStdin(process.stdin);
	// } catch (err) {
	// 	if (err.name === 'AvaError') {
	// 		// An AvaError may be thrown if chokidar is not installed. Log it nicely.
	// 		console.log('  ' + colors.error(figures.cross) + ' ' + err.message);
	// 		logger.exit(1);
	// 	} else {
	// 		// Rethrow so it becomes an uncaught exception.
	// 		throw err;
	// 	}
	// }

	var stream = op.stream.flatMapLatest(function(events) {
		if (options.batch) {
			files = events.map(function(e) {
				return e.path;
			});
		}
		return Bacon.fromPromise(avaProc().then(function(failCount) {
			return failCount > 0 ? new Bacon.Error("ava: " + failCount + " test(s) failed") : events;
		}));
	});

	return stream;
};