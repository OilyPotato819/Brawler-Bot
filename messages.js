class ErrorMessage extends Error {
  constructor(messageObject) {
    super(messageObject.content);

    this.name = 'ErrorMessage';
    this.messageObject = messageObject;
  }
}

const messages = {
  joinCall: (channelName) => ({
    content: `joined **${channelName}**`,
    ephemeral: false,
  }),
  addVideo: (title, url) => ({
    content: `added [**${title}**](${url}) to queue`,
    ephemeral: false,
  }),
  genericError: () => ({
    content: 'There was an error while executing this command',
    ephemeral: true,
  }),
  noVoice: () => ({
    content: 'you must be in a vc to use this command',
    ephemeral: true,
  }),
  alreadyInVoice: () => ({
    content: 'already in your voice channel',
    ephemeral: true,
  }),
  noYoutubeId: (url) => ({
    content: `could not find an id in **${url}**`,
    ephemeral: true,
  }),
  searchError: (query) => ({
    content: `error getting search results for query **${query}**`,
    ephemeral: true,
  }),
  noResults: (query) => ({
    content: `couldn't find any results for query **${query}**`,
    ephemeral: true,
  }),
  videoInfoError: () => ({
    content: `error fetching video info`,
    ephemeral: true,
  }),
  noVideoInfo: () => ({
    content: `couldn't get any video info`,
    ephemeral: true,
  }),
};

module.exports = { messages, ErrorMessage };
