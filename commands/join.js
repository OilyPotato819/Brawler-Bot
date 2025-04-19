const { SlashCommandBuilder } = require('discord.js');
const { replies, errors } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder().setName('join').setDescription('joins your vc'),
  async execute(interaction) {
    const memberVoice = interaction.member.voice.channel;
    if (!memberVoice) throw errors.noVoice;

    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    const clientVoiceId = audioManager.connection?.joinConfig.channelId;
    if (clientVoiceId === memberVoice.id) throw errors.alreadyInVoice;

    audioManager.join(memberVoice);
    interaction.reply(replies.joinCall(memberVoice.name));
  },
};
