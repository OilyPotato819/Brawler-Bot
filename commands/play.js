const { SlashCommandBuilder } = require('discord.js');
const { SongMenu } = require('../classes/songMenu.js');
const play = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('play a song')
    .addStringOption((option) => option.setName('input').setDescription('link or song name').setRequired(true)),
  async execute(interaction) {
    const input = interaction.options.getString('input');
    const queue = interaction.client.queueHandler.getQueue(interaction);

    if (!queue) return;

    if (input.startsWith('https://')) {
      const video = await play.video_basic_info(input).catch(() => {
        interaction.reply({
          content: 'not a valid youtube link',
          ephemeral: true,
        });
      });

      if (video) queue.add(video.video_details, interaction);
    } else {
      const youtubeResults = await queue.search(input);
      interaction.songMenu = new SongMenu(interaction, youtubeResults);
    }
  },
};
