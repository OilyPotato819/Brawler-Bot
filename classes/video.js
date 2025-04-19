const yts = require('yt-search');
const { errors } = require('../messages.js');

class Video {
  constructor(url) {
    this.id = this.extractID(url);
    this.title = null;
    this.url = null;
  }

  extractID(url) {
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      throw errors.invalidLink;
    }

    const match = url.match(/(?<=\/|v=)[-_A-Za-z0-9]{11}/);

    if (!match) {
      throw errors.videoId(url);
    }

    return match[0];
  }

  async getInfo() {
    let videoInfo;
    try {
      videoInfo = await yts({ videoId: this.id });
    } catch (error) {
      throw errors.videoInfo;
    }

    this.title = videoInfo.title;
    this.url = videoInfo.url;
  }
}

module.exports = Video;

// playlist id regex /(?<=list=)[-_A-Za-z0-9]+/
