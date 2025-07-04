const { SlashCommandBuilder } = require('discord.js');
const { Message } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder().setName('clear').setDescription('clear the queue'),
  execute(interaction) {
    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    const queue = audioManager.queue;

    if (!queue.length) return new Message('emptyQueue').send(interaction);

    queue.length = 0;
    new Message('clearedQueue').send(interaction);
  },
};
