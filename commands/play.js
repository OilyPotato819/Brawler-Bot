const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('play a song')
    .addStringOption((option) =>
      option.setName('input').setDescription('link or song name').setRequired(true)
    ),
  async execute(interaction) {
    const input = interaction.options.getString('input');
    const queue = interaction.client.queueHandler.getQueue(interaction);

    if (!queue) return;

    const hasVoice = queue.checkUserVoice(interaction);
    if (hasVoice) queue.pickSong(input, interaction);
  },
};
