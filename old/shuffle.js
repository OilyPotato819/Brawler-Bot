const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('shuffle').setDescription('toggle shuffling the queue'),
  async execute(interaction) {
    const queue = interaction.client.queueHandler.getQueue(interaction);

    queue.shuffle(interaction);
  },
};
