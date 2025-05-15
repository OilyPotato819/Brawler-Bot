const EventEmitter = require('events');

class Queue extends EventEmitter {
  constructor() {
    super();
    this.videos = [];
  }

  add(video) {
    this.videos.push(video);

    if (this.videos.length === 1) {
      this.emit('queueStarted');
    }
  }

  next() {
    return this.videos.shift();
  }
}

module.exports = Queue;
