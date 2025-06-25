const dedent = require('dedent');
const Channel = require('./channel.js');

class Playlist {
  constructor(info) {
    this.id = info.id;
    this.url = `https://www.youtube.com/playlist?list=${this.id}`;
    this.title = info.snippet.title;
    this.videoCount = info.contentDetails.itemCount;
    this.channel = new Channel(info);
  }

  listItem(num) {
    return dedent`
      ${num}. [${this.title}](<${this.url}>)  
        ${this.channel.title}  
        ${this.videoCount} videos
    `;
  }
}

module.exports = Playlist;
