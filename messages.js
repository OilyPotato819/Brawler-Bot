class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CustomError';
    this.messageObject = createMessage(message, true);
  }
}

function createMessage(content, ephemeral) {
  return { content, ephemeral };
}

const replies = {
  joinCall: (channelName) => createMessage(`joined **${channelName}**`, false),
  addVideo: (title, url) => createMessage(`added [**${title}**](${url}) to queue`, false),
};

const errors = {
  noVoice: new CustomError('you must be in a vc to use this command'),
  alreadyInVoice: new CustomError('already in your voice channel'),
  invalidLink: (url) => new CustomError(`${url} is not a valid link`),
  videoId: (url) => new CustomError(`could not find an id in ${url}`),
  videoInfo: (id) => new CustomError(`error fetching video info for ID ${id}`),
};

module.exports = { replies, errors, CustomError };
