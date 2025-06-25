const dedent = require('dedent');
const { messageFactory } = require('../messages.js');
const Channel = require('./channel.js');
const { getAge, formatDuration } = require('../utils/luxon-utils');
const formatNum = new Intl.NumberFormat('en-US', { notation: 'compact' }).format;

class Video {
  constructor(info) {
    this.id = info.id;
    this.url = `https://www.youtube.com/watch?v=${this.id}`;
    this.title = info.snippet.title;
    this.age = getAge(info.snippet.publishedAt);
    this.duration = formatDuration(info.contentDetails.duration);
    this.viewCount = formatNum(info.statistics.viewCount);
    this.thumbnail = info.snippet.thumbnails.medium.url;
    this.channel = new Channel(info);
  }

  listItem(num) {
    return dedent`
      ${num}. [${this.title}](<${this.url}>)  
        ${this.channel.title}  
        ${messageFactory.videoInfo(this.duration, this.viewCount, this.age)}
    `;
  }
}

module.exports = Video;
