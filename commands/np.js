const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { messageFactory } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('np')
    .setDescription('displays the song currently playing'),
  async execute(interaction) {
    const playing = interaction.client.audioManagerRegistry.get(interaction.guildId).playing;

    const message = playing
      ? messageFactory.nowPlaying(
          playing.duration,
          playing.likeCount,
          playing.viewCount,
          playing.age,
          playing.url
        )
      : messageFactory.nothingPlaying();

    interaction.reply(message);
  },
};
