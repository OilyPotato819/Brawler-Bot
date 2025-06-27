const { SlashCommandBuilder } = require('discord.js');
const { messageFactory } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('pause or resume the current song'),
  execute(interaction) {
    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    const player = audioManager.player;

    switch (player.state.status) {
      case 'playing':
        player.pause();
        return messageFactory.togglePlayback('paused');
      case 'paused':
        player.unpause();
        return messageFactory.togglePlayback('unpaused');
      default:
        return messageFactory.togglePlaybackError();
    }
  },
};
