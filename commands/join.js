const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('join').setDescription('joins your vc'),
  async execute(interaction) {
    const queue = interaction.client.queueHandler.getQueue(interaction);

    if (!queue) return;

    const hasVoice = queue.checkUserVoice(interaction);
    if (hasVoice) queue.join(interaction, true);
  },
};
