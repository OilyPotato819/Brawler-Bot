const { SlashCommandBuilder } = require('discord.js');
const { messages, ErrorMessage } = require('../messages.js');
const searchYoutube = require('../utils/search-youtube.js');
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
    if (!memberVoice) throw new ErrorMessage(messages.noVoice());

    const input = interaction.options.getString('input');
    const mediaType = interaction.options.getSubcommand();
    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);

    if (!audioManager.inVC(memberVoice.id)) audioManager.join(memberVoice);

    if (mediaType === 'video') {
      const deferPromise = interaction.deferReply({ ephemeral: true });

      const results = await searchYoutube(input, mediaType);

      await deferPromise;

      if (results.length === 1) {
        console.log(results[0]);
        audioManager.play(results[0]);
      } else {
        const videoPicker = new VideoPicker(interaction, input, results);
        audioManager.play(await videoPicker.choice);
      }

      // interaction.deleteReply();
      // interaction.channel.send(replies.addVideo(video.title, video.url));

      // console.log(queue.videos);
    }
  },
};
