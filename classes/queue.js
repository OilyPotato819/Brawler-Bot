class Queue {
  constructor() {
    this.videos = [];
  }

  add(video) {
    this.videos.push(video);
  }

  next() {
    return this.videos.shift();
  }
}

module.exports = Queue;
