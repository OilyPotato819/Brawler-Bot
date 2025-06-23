const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { messageFactory } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('np')
    .setDescription('displays the song currently playing'),
  async execute(interaction) {
    const playing = interaction.client.audioManagerRegistry.get(interaction.guildId).playing;

    if (!playing) {
      interaction.reply(messageFactory.nothingPlaying());
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xbfda34)
      .setTitle('Some title')
      .setURL('https://discord.js.org/')
      .setAuthor({
        name: 'Some name',
        iconURL: 'https://i.imgur.com/AfFp7pu.png',
        url: 'https://discord.js.org',
      })
      .setDescription('Some description here')
      .setThumbnail('https://i.imgur.com/AfFp7pu.png')
      .addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true }
      )
      .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
      .setImage('https://i.imgur.com/AfFp7pu.png')
      .setTimestamp()
      .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

    interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [embed] });
  },
};
