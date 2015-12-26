"use strict";

var log = require("sigh-core").log;
var Bacon = require("sigh-core").Bacon;
var Api = require("ava/api");
var reporter = require("ava/lib/reporters/verbose");
var Logger = require("ava/lib/logger");
var logger = new Logger();

var defaults = {
	serial: false,
	reporter: "verbose"
};

module.exports = function(op, files, options) {

	var isWatchMode = op.watch;
	options = Object.assign({}, defaults, options || {});
	var api = new Api(files, options);

	try {
		reporter = require("ava/lib/reporters/" + options.reporter);
	} catch (e) {
		log("Invalid option reporter (" + options.reporter + "), using default (verbose)");
	}

	logger.api = api;
	logger.use(reporter());

	api.on("test", logger.test);
	api.on("error", logger.unhandledError);

	var avaProc = function() {
		logger.start();
		return api.run()
			.then(function() {
				logger.finish();
				var failCount = api.failCount + api.rejectionCount + api.exceptionCount;
				if (!isWatchMode) {
					logger.exit(failCount > 0 ? 1 : 0);
				}
				return failCount;
			})
			.catch(function(err) {
				console.error(err.stack); // eslint-disable-line no-console
				logger.exit(1);
				return err;
			});
	};

	var stream = op.stream.flatMapLatest(function(events) {
		return Bacon.fromPromise(avaProc().then(function(failCount) {
			return failCount > 0 ? new Bacon.Error("ava: " + failCount + " test(s) failed") : events;
		}));
	});

	return stream;
};