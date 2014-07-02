#!/usr/bin/env node

var path = require('path'),
	Justin = require('../'),
	moment = require('moment'),
	program = require('commander');

program
	.version(require('../package.json').version)
	.usage("[options]")
	.option('-s, start', 'start the timer')
	.option('-e, end', 'stop the timer')
	.option('-t, time', 'get the total time')
	.option('-m, message', 'add a progress message')
	.option('-d, delete', 'delete the timer')
	.option('-r, read', 'list progress messages')
	.option('-l, list', 'list created timers')
	.option('-g, all', 'do for each timer')
	.option('-a, active', 'do for each active timer')
	.option('-j, jump <skip>', 'skip for messages')
	.option('-c, count <limit>', 'limit for messages')
	.parse(process.argv);

var root = process.cwd(),
	file = path.join(root, 'justin.json'),
	just = Justin(file);
	program.multi = program.all || program.active,
	program.timer = program.all ? null : program.args.shift();

just.readConfig(function(error) {
	if(error) throw error;
	if(program.list) {
		var timers = just.timers;
		if(program.active) timers = timers.filter(function(t) {
			return t.isActive();
		});
		return console.log(timers.map(function(t) {
			return t.name;
		}).join('\n'));
	}

	var timers = program.all 
		? just.timers
		: program.active
			? just.timers.filter(function(timer) {
				return timer.isActive();
			})
			: program.timer 
				? [just.findTimer(program.timer)]
				: [],
		p = print.bind(null, timers);

	if(program.start) p(function(timer) {
		timer.start();
		return "has started.";
	});
	if(program.end) p(function(timer) {
		timer.end();
		return "has stopped.";
	});
	if(program.time) printTimes(timers);
	if(program.message) {
		if(!program.args.length && !program.multi) return;
		var quoted = false,
			msg = program.args.reduce(function(sentence, word) {
				if(word.charAt(0) === '"' && word.charAt(word.length - 1) === '"') {
					sentence = [word];
					quoted = true;
				}
				if(!quoted) sentence.push(word);
				return sentence;
			}, []).join(" ");
		p(function(timer) {
			timer.message(msg);
			return "has saved the message.";
		});
	}
	if(program.delete) p(function(timer) {
		timer.remove();
		return "has been deleted.";
	});
	if(program.read) p(function(timer) {
		return timer.messages;
	}, function(messageSets) {
		return messageSets.reduce(function(s,c) {
			return s.concat(c);
		}, []).sort(function(a,b) {
			return b.date - a.date;
		}).slice(program.skip || 0, program.limit || 10).map(function(m) {
			return moment(m.date).format('L')+": "+m.text;
		});
	});
	if(program.active && program.timer) {
		print([just.findTimer(program.timer)], function(timer) {
			return timer.isActive() 
				? "is active." 
				: "is not active.";
		});
	}

	just.writeConfig();
});

function printTimes(timers) {
	var total = 0,
		times = timers.map(function(timer) {
			var time = timer.time(),
				str = timer.name+": ";
			total += time;
			if(program.multi) return str + moment.duration(time).humanize();
			return moment.duration(time).humanize();
		});
	if(program.multi) times.push("total: "+moment.duration(total).humanize());
	console.log(times.join('\n'));
}

var printed = false;
function print(timers, map, mapAll) {
	var mapped = timers.map(map);
	printed = true;
	if(mapAll) return log(mapAll(mapped));
	mapped.forEach(function(item, index) {
		log(((timers[index] || {}).name || "all")+" "+item);
	});

	function log(data) {
		if(Array.isArray(data)) data = data.join('\n');
		console.log(data);
	}
}


