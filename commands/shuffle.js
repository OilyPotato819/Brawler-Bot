const { SlashCommandBuilder } = require('discord.js');
const { Message } = require('../messages.js');
const shuffleArray = require('../utils/shuffle-array.js');

module.exports = {
  data: new SlashCommandBuilder().setName('shuffle').setDescription('shuffles the queue'),
  async execute(interaction) {
    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    const queue = audioManager.queue;

    if (!queue.length) return new Message('emptyQueue').send(interaction);

    shuffleArray(queue);
    new Message('shuffle').send(interaction);
  },
};
