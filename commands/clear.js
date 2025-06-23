const { SlashCommandBuilder } = require('discord.js');
const { messageFactory } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder().setName('clear').setDescription('clear the queue'),
  async execute(interaction) {
    const queue = interaction.client.audioManagerRegistry.get(interaction.guildId).queue;

    let message;
    if (queue.length()) {
      queue.clear();
      message = messageFactory.clearedQueue();
    } else {
      message = messageFactory.emptyQueue();
    }

    interaction.reply(message);
  },
};
