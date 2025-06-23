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

  clear() {
    this.videos = [];
  }

  length() {
    return this.videos.length;
  }
}

module.exports = Queue;
