class Video {
  constructor(info) {
    this.id = info.id;
    this.title = info.snippet.title;
    this.channel = info.snippet.channelTitle;
    this.duration = info.contentDetails.duration;
    this.viewCount = info.statistics.viewCount;
    this.likeCount = info.statistics.likeCount;
  }
}

module.exports = Video;
