const { MessageFlags, TextDisplayBuilder } = require('discord.js');

class Message {
  constructor(templateName, contentArgs = []) {
    const template = messageTemplates[templateName];
    if (!template) throw new Error('not a valid template name');

    this.content = template.content(...contentArgs);
    this.flags = [];
    this.embeds = [];
    this.components = [];
    this.allowedMentions = { parse: [] };

    if (template.ephemeral) this.flags.push(MessageFlags.Ephemeral);
  }

  send(interaction) {
    if (interaction.isComponentsV2) this.toComponentsV2();

    if (interaction.replied || interaction.deferred) {
      interaction.editReply(this);
    } else {
      interaction.reply(this);
    }
  }

  toComponentsV2() {
    this.components.push(new TextDisplayBuilder().setContent(this.content));
    delete this.content;
    this.flags.push(MessageFlags.IsComponentsV2);
  }
}

class ErrorMessage extends Error {
  constructor(templateName, contentArgs) {
    const message = new Message(templateName, contentArgs);
    super(message.content);

    this.name = 'ErrorMessage';
    this.discordMessage = message;
  }
}

const contentTemplates = {
  addVideo: (userId, title) => `<@${userId}> added **${title}** to queue`,
  addPlaylist: (userId, videoCount, title) =>
    `<@${userId}> added ${videoCount} videos from **${title}** to queue`,
  videoInfo: (duration, viewCount, age) =>
    `⌛  ${duration}   •   👁️  ${viewCount}   •   🗓️  ${age}`,
};

const messageTemplates = {
  joinCall: {
    content: (channelId) => `joined <#${channelId}>`,
    ephemeral: false,
  },
  clearedQueue: {
    content: () => 'cleared the queue',
    ephemeral: false,
  },
  togglePlayback: {
    content: (toggleState) => `${toggleState} the player`,
    ephemeral: false,
  },
  skip: {
    content: (playingTitle) => `skipped **${playingTitle}**`,
    ephemeral: false,
  },
  remove: {
    content: (skippedTitle, removeNum) => {
      const parts = [];
      if (skippedTitle) parts.push(`skipped **${skippedTitle}**`);
      if (removeNum) {
        const itemLabel = removeNum === 1 ? 'video' : 'videos';
        parts.push(`removed ${removeNum} ${itemLabel} from queue`);
      }
      return parts.join(' and ');
    },
    ephemeral: false,
  },
  shuffle: {
    content: () => 'shuffled the queue',
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
  noPlaylistVideos: {
    content: (playlistTitle) => `couldn't find any videos in **${playlistTitle}**`,
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
  togglePlaybackError: {
    content: () => 'unable to toggle playback',
    ephemeral: true,
  },
  invalidRange: {
    content: () => 'not a valid range',
    ephemeral: true,
  },
};

module.exports = { Message, ErrorMessage, contentTemplates };
