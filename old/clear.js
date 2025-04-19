const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('clear').setDescription('clear the queue'),
  async execute(interaction) {
    const queue = interaction.client.queueHandler.getQueue(interaction);

    queue.clear(interaction);
  },
};
