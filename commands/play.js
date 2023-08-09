const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('play a video or playlist using link or query')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('video')
        .setDescription('play a video using link or query')
        .addStringOption((option) =>
          option.setName('input').setDescription('link or query').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('playlist')
        .setDescription('play a playlist using link or query')
        .addStringOption((option) =>
          option.setName('input').setDescription('link or query').setRequired(true)
        )
    ),
  async execute(interaction) {
    const input = interaction.options.getString('input');
    const subcommand = interaction.options.getSubcommand();
    const queue = interaction.client.queueHandler.getQueue(interaction);

    if (!queue) return;

    const hasVoice = queue.checkUserVoice(interaction);
    if (hasVoice) queue.pickSong(input, subcommand, interaction);
  },
};
