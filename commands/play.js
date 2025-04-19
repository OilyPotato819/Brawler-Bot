const { SlashCommandBuilder } = require('discord.js');
const { replies } = require('../messages.js');
const getResults = require('../classes/video.js');
const VideoPicker = require('../classes/video-picker.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('play a video or playlist using link or query')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('video')
        .setDescription('add a video to the queue using a link or query')
        .addStringOption((option) =>
          option.setName('input').setDescription('link or query').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('playlist')
        .setDescription('add a playlist to the queue using a link or query')
        .addStringOption((option) =>
          option.setName('input').setDescription('link or query').setRequired(true)
        )
    ),
  async execute(interaction) {
    const memberVoice = interaction.member.voice.channel;
    if (!memberVoice) throw errors.noVoice;

    const input = interaction.options.getString('input');
    const mediaType = interaction.options.getSubcommand();
    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    const clientVoiceId = audioManager.connection?.joinConfig.channelId;

    if (clientVoiceId != memberVoice.id) audioManager.join(memberVoice);

    if (mediaType === 'video') {
      await interaction.deferReply({ ephemeral: true });

      const results = await getResults(input);

      let video;
      if (Array.isArray(results)) {
        const videoPicker = new VideoPicker(results);
      } else {
        audioManager.addVideo(video);
      }

      // queue.addVideo(video);

      // interaction.deleteReply();
      // interaction.channel.send(replies.addVideo(video.title, video.url));

      // console.log(queue.videos);
    }
  },
};
