const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('pause the current song'),
  async execute(interaction) {
    const queue = interaction.client.queueHandler.getQueue(interaction);

    if (!queue) return;

    queue.pause(interaction);
  },
};
