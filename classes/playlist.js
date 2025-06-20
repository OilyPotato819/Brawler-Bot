const dedent = require('dedent');

class Playlist {
  constructor(info) {
    this.id = info.id;
    this.url = `https://www.youtube.com/playlist?list=${this.id}`;
    this.title = info.snippet.title;
    this.channel = info.snippet.channelTitle;
    this.itemCount = info.contentDetails.itemCount;
  }

  listItem(num) {
    return dedent`
      ${num}. [${this.title}](<${this.url}>)  
        ${this.channel}  
        ${this.itemCount} videos
    `;
  }
}

module.exports = Playlist;
