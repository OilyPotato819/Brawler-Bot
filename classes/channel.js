class Channel {
  constructor(info) {
    this.title = info.snippet.channelTitle;
    this.id = info.snippet.channelId;
    this.url = `https://www.youtube.com/channel/${this.id}`;
    this.thumbnail = null;
  }
}

module.exports = Channel;
