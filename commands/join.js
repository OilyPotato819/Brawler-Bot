const { SlashCommandBuilder } = require('discord.js');
const { messages, ErrorMessage } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder().setName('join').setDescription('joins your vc'),
  async execute(interaction) {
    const memberVoice = interaction.member.voice.channel;
    if (!memberVoice) {
      throw new ErrorMessage(messages.noVoice());
    }

    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    if (audioManager.inVoiceChannel(memberVoice.id)) {
      throw new ErrorMessage(messages.alreadyInVoice());
    }

    audioManager.join(memberVoice);
    interaction.reply(messages.joinCall(memberVoice.name));
  },
};
