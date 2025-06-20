const { messages, ErrorMessage } = require('../messages.js');
const Video = require('../classes/video.js');
const Playlist = require('../classes/playlist.js');
const { google } = require('googleapis');
require('dotenv').config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_KEY,
});

async function searchYoutube(query, type) {
  const typeConfig = {
    video: {
      pattern: /(?<=\/|v=)[-_A-Za-z0-9]{11}/,
      part: 'contentDetails,snippet,statistics',
      class: Video,
    },
    playlist: {
      pattern: /(?<=list=)[-_A-Za-z0-9]+/,
      part: 'contentDetails,snippet',
      class: Playlist,
    },
  };

  const config = typeConfig[type];
  if (!config) throw new Error(`Invalid type: ${type}`);

  let youtubeIds = [];
  if (query.includes('youtube.com') || query.includes('youtu.be')) {
    const match = query.match(config.pattern);
    if (!match) throw new ErrorMessage(messages.noYoutubeId(query));
    youtubeIds.push(match[0]);
  } else {
    const searchResponse = await youtube.search
      .list({
        part: 'id',
        q: query,
        type: type,
      })
      .catch(() => {
        throw new ErrorMessage(messages.searchError(query));
      });

    if (!searchResponse.data.items.length) throw new ErrorMessage(messages.noResults(query));

    for (const item of searchResponse.data.items) {
      youtubeIds.push(item.id[`${type}Id`]);
    }
  }

  const listResponse = await youtube[`${type}s`]
    .list({
      part: config.part,
      id: youtubeIds.join(),
    })
    .catch(() => {
      throw new ErrorMessage(messages.videoInfoError());
    });

  if (!listResponse.data.items.length) throw new ErrorMessage(messages.noVideoInfo());

  let resources = [];
  for (const item of listResponse.data.items) {
    resources.push(new config.class(item));
  }

  return resources;
}

module.exports = searchYoutube;
