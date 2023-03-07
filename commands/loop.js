const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('loop').setDescription('loop the player'),
  async execute(interaction) {
    const queue = interaction.client.queueHandler.getQueue(interaction);

    if (!queue) return;

    if (queue.looping === true) {
      queue.looping = false;
      interaction.reply('turned looping **off**');
    } else {
      queue.looping = true;
      interaction.reply('turned looping **on**');
    }
  },
};
