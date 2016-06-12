"use strict";

const avaCli = require.resolve("ava/cli.js");
// const log = require("sigh-core").log;
const Bacon = require("sigh-core").Bacon;
const spawn = require("child_process").spawn;
const _ = require("lodash");
const figures = require("figures");
const beeper = require("beeper");
const stripColor = require("strip-color");

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
		proc.stderr.on("data", b => {
			var s = _.trim(stripColor(b.toString()));
			if (s.indexOf(figures.cross) === 0) {
				beeper();
			}
		});
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