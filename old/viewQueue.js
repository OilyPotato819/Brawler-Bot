const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('displays the queue'),
  async execute(interaction) {
    const queue = interaction.client.queueHandler.getQueue(interaction);

    queue.viewQueue(interaction);
  },
};
