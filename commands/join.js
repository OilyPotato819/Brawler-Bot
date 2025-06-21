const { SlashCommandBuilder } = require('discord.js');
const { messageFactory, ErrorMessage } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder().setName('join').setDescription('joins your vc'),
  async execute(interaction) {
    const memberVoice = interaction.member.voice.channel;
    if (!memberVoice) {
      throw new ErrorMessage(messageFactory.noVoice());
    }

    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    if (audioManager.inVC(memberVoice.id)) {
      throw new ErrorMessage(messageFactory.alreadyInVoice());
    }

    audioManager.join(memberVoice);
    interaction.reply(messageFactory.joinCall(memberVoice.name));
  },
};
