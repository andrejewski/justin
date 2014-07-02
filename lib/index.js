
var fs = require('fs'),
	Timer = require('./timer');

module.exports = Justin;

function Justin(filepath) {
	if(!(this instanceof Justin)) return new Justin(filepath);
	this.filepath = filepath;
}

Justin.prototype.readConfig = function(next) {
	var just = this;
	fs.readFile(this.filepath, 'utf8', function(error, data) {
		if(error) {
			if(error.code !== 'ENOENT') return next(error);
			data = '{"timers": []}';
			error = null;
		}
		just.timers = JSON.parse(data).timers.map(Timer);
		next(error);
	});
}

Justin.prototype.writeConfig = function() {
	fs.writeFileSync(this.filepath, JSON.stringify(this.toJSON()));
}

Justin.prototype.listTimers = function(filter) {
	return this.timers.filter(filter || function() {return true;});
}

Justin.prototype.findTimer = function(name) {
	for(var i in this.timers) {
		var timer = this.timers[i];
		if(timer.name === name) return timer;
	}
	return this.createTimer(name);
}

Justin.prototype.createTimer = function(name) {
	var timer = Timer({name: name});
	this.timers.push(timer);
	return timer;
}

Justin.prototype.toJSON = function() {
	return {
		timers: this.timers.filter(function(timer) {
			return !timer.removed;
		}).map(function(timer) {
			return timer.toJSON();
		})
	};
}