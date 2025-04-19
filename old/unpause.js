const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('unpause').setDescription('unpause the current song'),
  async execute(interaction) {
    const queue = interaction.client.queueHandler.getQueue(interaction);

    queue.unpause(interaction);
  },
};
