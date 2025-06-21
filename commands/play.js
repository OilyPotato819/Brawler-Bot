const { SlashCommandBuilder } = require('discord.js');
const { messageFactory, ErrorMessage } = require('../messages.js');
const { searchYoutube } = require('../utils/youtube-utils.js');
const ContentPicker = require('../classes/content-picker.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('play a video or playlist using link or query')
    .addStringOption((option) =>
      option.setName('input').setDescription('link or query').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('type of content to play')
        .addChoices({ name: 'video', value: 'video' }, { name: 'playlist', value: 'playlist' })
    ),
  async execute(interaction) {
    const memberVoice = interaction.member.voice.channel;
    if (!memberVoice) throw new ErrorMessage(messageFactory.noVoice());

    const input = interaction.options.getString('input');
    const contentType = interaction.options.getString('type') ?? 'video';
    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);

    const deferPromise = interaction.deferReply({ ephemeral: true });
    const results = await searchYoutube(input, contentType);
    await deferPromise;

    let content;
    if (results.length === 1) {
      content = results[0];
    } else {
      const contentPicker = new ContentPicker(input, results);
      content = await contentPicker.getChoice(interaction);
    }

    if (!audioManager.inVC(memberVoice.id)) audioManager.join(memberVoice);
    interaction.deleteReply();

    if (contentType === 'video') {
      audioManager.play(content);
      interaction.channel.send(
        messageFactory.addVideo(interaction.user.id, content.title, content.url)
      );
    } else if (contentType === 'playlist') {
      console.log(content);
    }
  },
};
