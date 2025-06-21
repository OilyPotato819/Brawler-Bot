class ErrorMessage extends Error {
  constructor(messageObject) {
    super(messageObject.content);

    this.name = 'ErrorMessage';
    this.messageObject = messageObject;
  }
}

function createMessage(content, ephemeral) {
  return {
    content,
    ephemeral,
    embeds: [],
    components: [],
  };
}

const messageFactory = {
  joinCall: {
    content: (channelName) => `joined **${channelName}**`,
    ephemeral: false,
  },
  addVideo: {
    content: (userId, title, url) => `<@${userId}> added [**${title}**](${url}) to queue`,
    ephemeral: false,
  },
  addPlaylist: {
    content: (userId, videoCount) => `<@${userId}> added **${videoCount} videos** to queue`,
    ephemeral: false,
  },
  genericError: {
    content: () => 'There was an error while executing this command',
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
};

for (const [key, message] of Object.entries(messageFactory)) {
  messageFactory[key] = (...args) => ({
    content: message.content(...args),
    ephemeral: message.ephemeral,
    embeds: [],
    components: [],
  });
}

module.exports = { messageFactory, ErrorMessage };
