const { SlashCommandBuilder } = require('discord.js');
const { messageFactory } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder().setName('clear').setDescription('clear the queue'),
  execute(interaction) {
    const queue = interaction.client.audioManagerRegistry.get(interaction.guildId).queue;

    if (!queue.length()) return messageFactory.emptyQueue();

    queue.clear();
    return messageFactory.clearedQueue();
  },
};
