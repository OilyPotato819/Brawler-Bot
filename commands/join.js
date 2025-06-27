const { SlashCommandBuilder } = require('discord.js');
const { messageFactory } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder().setName('join').setDescription('joins your vc'),
  execute(interaction) {
    const memberVoice = interaction.member.voice.channel;
    if (!memberVoice) return messageFactory.noVoice();

    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    if (audioManager.inVC(memberVoice.id)) return messageFactory.alreadyInVoice();

    audioManager.join(memberVoice);
    return messageFactory.joinCall(memberVoice.id);
  },
};
