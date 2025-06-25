const { MessageFlags } = require('discord.js');

class ErrorMessage extends Error {
  constructor(messageObject) {
    super(messageObject.content);

    this.name = 'ErrorMessage';
    this.messageObject = messageObject;
  }
}

const messageFactory = {
  addVideo: (userId, title) => `<@${userId}> added **${title}** to queue`,
  addPlaylist: (userId, videoCount, title) =>
    `<@${userId}> added **${videoCount} videos** from **${title}** to queue`,
  videoInfo: (duration, viewCount, age) =>
    `⌛  ${duration}   •   👁️  ${viewCount}   •   🗓️  ${age}`,
  joinCall: {
    content: (channelId) => `joined <#${channelId}>`,
    ephemeral: false,
  },
  clearedQueue: {
    content: () => 'cleared the queue',
    ephemeral: false,
  },
  genericError: {
    content: () => 'there was an error while executing this command',
    ephemeral: true,
  },
  noVoice: {
    content: () => 'you must be in a vc to use this command',
    ephemeral: true,
  },
  alreadyInVoice: {
    content: () => 'already in your voice channel',
    ephemeral: true,
  },
  noYoutubeId: {
    content: (url) => `could not find an id in **${url}**`,
    ephemeral: true,
  },
  searchError: {
    content: (query) => `error getting search results for query **${query}**`,
    ephemeral: true,
  },
  noResults: {
    content: (query) => `couldn't find any results for query **${query}**`,
    ephemeral: true,
  },
  getInfoError: {
    content: (type) => `error fetching ${type} info`,
    ephemeral: true,
  },
  getVideosError: {
    content: () => 'error getting playlist videos',
    ephemeral: true,
  },
  emptyPlaylist: {
    content: () => 'this playlist has no videos',
    ephemeral: true,
  },
  tooLong: {
    content: () => 'you took too long',
    ephemeral: true,
  },
  emptyQueue: {
    content: () => 'the queue is already empty',
    ephemeral: true,
  },
  nothingPlaying: {
    content: () => 'nothing is playing right now',
    ephemeral: true,
  },
};

for (const [key, message] of Object.entries(messageFactory)) {
  if (typeof message !== 'object') continue;

  const flags = messageFactory[key]?.ephemeral ? MessageFlags.Ephemeral : undefined;
  messageFactory[key] = (...args) => ({
    content: message.content(...args),
    flags,
    embeds: [],
    components: [],
    allowedMentions: { parse: [] },
  });
}

module.exports = { messageFactory, ErrorMessage };
