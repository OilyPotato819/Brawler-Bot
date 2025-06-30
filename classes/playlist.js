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

  toSelectEntry() {
    return dedent`
      [⬤   ](<${this.url}>)**${this.title}**
      ${this.channel.title}
      ${this.videoCount} videos
    `;
  }
}

module.exports = Playlist;
