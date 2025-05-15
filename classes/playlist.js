class Playlist {
  constructor(info) {
    this.id = info.id;
    this.title = info.snippet.title;
    this.channel = info.snippet.channelTitle;
    this.itemCount = info.contentDetails.itemCount;
  }
}

module.exports = Playlist;
