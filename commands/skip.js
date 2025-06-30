const { SlashCommandBuilder } = require('discord.js');
const { Message } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('skip the current song'),
  async execute(interaction) {
    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);

    if (!audioManager.playing) return new Message('nothingPlaying').send(interaction);

    const skipped = audioManager.skip();
    new Message('skip', [skipped.title]).send(interaction);
  },
};
