
module.exports = Timer;

function Timer(data) {
	if(!(this instanceof Timer)) return new Timer(data);
	this.name = data.name;
	this.sessions = this.casteSessions(data.sessions || []);
	this.messages = this.casteMessages(data.messages || []);
	this.removed = false;
}

Timer.prototype.casteSessions = function(sessions) {
	return sessions.map(function(session) {
		return {
			start: new Date(session.start),
			end: session.end ? new Date(session.end) : session.end
		};
	});
}

Timer.prototype.casteMessages = function(messages) {
	return messages.map(function(message) {
		message.date = new Date(message.date);
		return message;
	});
}

Timer.prototype.isActive = function() {
	return !this.sessions[this.sessions.length - 1].end;
}

Timer.prototype.start = function() {
	var timer = this;
	if(this.sessions.length === 0 || this.sessions[this.sessions.length - 1].end) {
		this.sessions.push({
			start: new Date(),
			end: null
		});
	}
}

Timer.prototype.end = function() {
	var lastTime = this.sessions[this.sessions.length - 1],
		now = new Date();
	if(!lastTime.end) lastTime.end = now;
}

Timer.prototype.time = function() {
	return this.sessions.reduce(function(t,s) {
		return t + s.end ? (s.end.getTime() - s.start.getTime()): 0;
	});
}

Timer.prototype.message = function(message) {
	this.messages.push({
		text: message,
		date: new Date()
	});
}

Timer.prototype.remove = function() {
	this.removed = true;
}

Timer.prototype.toJSON = function() {
	return {
		name: this.name,
		sessions: this.sessions,
		messages: this.messages
	};
}
