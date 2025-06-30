const { SlashCommandBuilder } = require('discord.js');
const { Message } = require('../messages.js');

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
        new Message('togglePlayback', ['paused']).send(interaction);
        break;
      case 'paused':
        player.unpause();
        new Message('togglePlayback', ['unpaused']).send(interaction);
        break;
      default:
        new Message('togglePlaybackError').send(interaction);
    }
  },
};
