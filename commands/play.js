const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('play a song')
    .addStringOption((option) =>
      option.setName('input').setDescription('link or song name').setRequired(true)
    )
    .addBooleanOption((option) =>
      option.setName('playlists').setDescription('whether or not you want to include playlists in the search')
    ),
  async execute(interaction) {
    const input = interaction.options.getString('input');
    const addPlaylists = interaction.options.getBoolean('playlists');
    const queue = interaction.client.queueHandler.getQueue(interaction);

    if (!queue) return;

    const hasVoice = queue.checkUserVoice(interaction);
    if (hasVoice) queue.pickSong(input, addPlaylists, interaction);
  },
};
