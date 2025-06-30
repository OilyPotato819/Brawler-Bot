const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('displays the queue'),
  async execute(interaction) {
    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    const queue = audioManager.queue;
  },
};
