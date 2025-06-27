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
    this.videos.length = 0;
  }

  length() {
    return this.videos.length;
  }

  remove(start, deleteCount) {
    this.videos.splice(start, deleteCount);
  }
}

module.exports = Queue;
