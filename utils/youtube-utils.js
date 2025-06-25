const { messageFactory, ErrorMessage } = require('../messages.js');
const Video = require('../classes/video.js');
const Playlist = require('../classes/playlist.js');
const { google } = require('googleapis');
require('dotenv').config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_KEY,
});

const config = {
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

async function getYoutubeInfo(ids, type) {
  if (!config[type]) throw new Error(`Invalid type: ${type}`);

  const listResponse = await youtube[`${type}s`]
    .list({
      part: config[type].part,
      id: ids.join(),
    })
    .catch(() => {
      throw new ErrorMessage(messageFactory.getInfoError(type));
    });

  const items = listResponse.data.items;
  return items.map((item) => new config[type].class(item));
}

async function searchYoutube(query, type) {
  if (!config[type]) throw new Error(`Invalid type: ${type}`);

  let ids;
  if (query.includes('youtube.com') || query.includes('youtu.be')) {
    const match = query.match(config[type].pattern);
    if (!match) throw new ErrorMessage(messageFactory.noYoutubeId(query));
    ids = [match[0]];
  } else {
    const searchResponse = await youtube.search
      .list({
        part: 'id',
        q: query,
        type: type,
      })
      .catch(() => {
        throw new ErrorMessage(messageFactory.searchError(query));
      });

    const items = searchResponse.data.items;
    if (!items.length) throw new ErrorMessage(messageFactory.noResults(query));

    ids = items.map((item) => item.id[`${type}Id`]);
  }

  return getYoutubeInfo(ids, type);
}

async function getPlaylistVideos(playlistId) {
  let videos = [];
  let pageToken;
  do {
    const listResponse = await youtube.playlistItems
      .list({
        part: 'contentDetails',
        playlistId,
        maxResults: 50,
        pageToken,
      })
      .catch(() => {
        throw new ErrorMessage(messageFactory.getVideosError());
      });

    const items = listResponse.data.items;
    if (!items.length) throw new ErrorMessage(messageFactory.emptyPlaylist());

    const ids = items.map((item) => item.contentDetails.videoId);
    const newVideos = await getYoutubeInfo(ids, 'video');
    videos.push(...newVideos);

    pageToken = listResponse.data.nextPageToken;
  } while (pageToken);

  return videos;
}

async function getChannelThumbnail(id) {
  const listResponse = await youtube.channels
    .list({
      part: 'snippet',
      id,
    })
    .catch(() => {
      throw new ErrorMessage(messageFactory.getInfoError('channel'));
    });

  const item = listResponse.data.items[0];
  return item.snippet.thumbnails.default.url;
}

module.exports = { searchYoutube, getPlaylistVideos, getChannelThumbnail };
