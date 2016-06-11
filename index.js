"use strict";

const avaCli = require.resolve("ava/cli.js");
// const log = require("sigh-core").log;
const Bacon = require("sigh-core").Bacon;
const spawn = require("child_process").spawn;
const _ = require("lodash");

const defaults = {};

module.exports = function(op, options) {
	options = _.defaults({}, defaults, options || {});
	var files = _.get(options, "files");
	options = _.omit(options, ["files"]);
	var procArgs = [avaCli, files];
	_.each(options, (value, key) => {
		procArgs.push("--" + key + "=" + value);
	});
	if (op.watch) {
		procArgs.push("--watch");
	}
	// procArgs.push("--verbose");
	var proc = spawn("node", procArgs);
	proc.stderr.pipe(process.stdout);
	if (op.watch) {
		return op.stream;
	}
	return op.stream.flatMapLatest(events => {
		var avaProcClose = new Promise(resolve => {
			proc.on("close", resolve);
		});
		return Bacon.fromPromise(avaProcClose.then(code => {
			return (code !== 0) ? new Bacon.Error("ava: test(s) failed") : events;
		}));
	});
};