const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('skip the first song in queue'),
  async execute(interaction) {
    const queue = interaction.client.queueHandler.getQueue(interaction);

    if (!queue) return;

    queue.skip(interaction);
  },
};
