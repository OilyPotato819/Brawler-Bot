const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('skip the current song'),
  async execute(interaction) {
    const queue = interaction.client.queueHandler.getQueue(interaction);

    queue.skip(interaction);
  },
};
