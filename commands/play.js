const { SlashCommandBuilder, MessageFlags, SectionBuilder, ButtonStyle } = require('discord.js');
const { messageFactory, ErrorMessage } = require('../messages.js');
const { searchYoutube, getPlaylistVideos } = require('../utils/youtube-utils.js');
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

    const deferPromise = interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const results = await searchYoutube(input, contentType);
    await deferPromise;

    let content;
    if (results.length === 1) {
      content = results[0];
    } else {
      const contentPicker = new ContentPicker(input, results);
      content = await contentPicker.getChoice(interaction);
    }

    const userId = interaction.user.id;
    let videoArray;
    let messageContent;
    if (contentType === 'video') {
      videoArray = [content];
      messageContent = messageFactory.addVideo(userId, content.title);
    } else if (contentType === 'playlist') {
      videoArray = await getPlaylistVideos(content.id);
      messageContent = messageFactory.addPlaylist(userId, content.videoCount, content.title);
    }

    if (!audioManager.inVC(memberVoice.id)) audioManager.join(memberVoice);
    audioManager.play(videoArray);

    const section = new SectionBuilder()
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent(messageContent))
      .setButtonAccessory((button) =>
        button.setLabel('Link').setURL(content.url).setStyle(ButtonStyle.Link)
      );

    interaction.deleteReply();
    interaction.channel.send({
      components: [section],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
    });
  },
};
