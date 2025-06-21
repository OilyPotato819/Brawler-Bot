const dedent = require('dedent');
const { getAge, formatDuration } = require('../utils/luxon-utils');
const formatNum = new Intl.NumberFormat('en-US', { notation: 'compact' }).format;

class Video {
  constructor(info) {
    this.id = info.id;
    this.url = `https://www.youtube.com/watch?v=${this.id}`;
    this.title = info.snippet.title;
    this.channel = info.snippet.channelTitle;
    this.age = getAge(info.snippet.publishedAt);
    this.duration = formatDuration(info.contentDetails.duration);
    this.viewCount = formatNum(info.statistics.viewCount);

    const likeCount = info.statistics.likeCount;
    this.likeCount = likeCount ? formatNum(likeCount) : null;
  }

  listItem(num) {
    return dedent`
      ${num}. [${this.title}](<${this.url}>)  
        ${this.channel}  
        ${this.duration}  •  ${this.viewCount}  •  ${this.age}
    `;
  }
}

module.exports = Video;
