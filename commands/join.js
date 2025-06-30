const { SlashCommandBuilder } = require('discord.js');
const { Message } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder().setName('join').setDescription('joins your vc'),
  execute(interaction) {
    const memberVoice = interaction.member.voice.channel;
    if (!memberVoice) {
      new Message('noVoice').send(interaction);
      return;
    }

    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    if (audioManager.inVC(memberVoice.id)) {
      new Message('alreadyInVoice').send(interaction);
      return;
    }

    audioManager.join(memberVoice);
    new Message('joinCall', [memberVoice.id]).send(interaction);
  },
};
