const EventEmitter = require('events');

class Queue extends EventEmitter {
  constructor() {
    super();
    this.songs = [];
  }

  addSong(song) {
    this.songs.push(song);

    if (this.songs.length === 1) {
      this.emit('queueStarted');
    }
  }

  nextSong() {
    return this.songs.shift();
  }
}

module.exports = Queue;
