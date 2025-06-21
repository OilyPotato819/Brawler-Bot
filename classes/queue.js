class Queue {
  constructor() {
    this.videos = [];
  }

  add(videos) {
    this.videos.push(...videos);
  }

  next() {
    return this.videos.shift();
  }
}

module.exports = Queue;
