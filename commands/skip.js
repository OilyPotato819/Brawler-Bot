const { SlashCommandBuilder } = require('discord.js');
const { messageFactory } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('skip the current song'),
  async execute(interaction) {
    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);

    if (!audioManager.playing) return messageFactory.nothingPlaying();

    const skipped = audioManager.skip();
    return messageFactory.skip(skipped.title);
  },
};
