const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getChannelThumbnail } = require('../utils/youtube-utils.js');
const { Message, contentTemplates } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('np')
    .setDescription('displays the song currently playing'),
  async execute(interaction) {
    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    const playing = audioManager.playing;

    if (!playing) return new Message('nothingPlaying').send(interaction);

    const channel = playing.channel;
    channel.thumbnail ??= await getChannelThumbnail(channel.id);

    const embed = new EmbedBuilder()
      .setColor(0xbfda34)
      .setAuthor({
        name: channel.title,
        iconURL: channel.thumbnail,
        url: channel.url,
      })
      .setTitle(playing.title)
      .setURL(playing.url)
      .setImage(playing.thumbnail)
      .setFooter({
        text: contentTemplates.videoInfo(
          playing.duration,
          playing.viewCount,
          playing.age
        ),
      });

    interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [embed] });
  },
};
