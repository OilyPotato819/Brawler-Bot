const { SlashCommandBuilder } = require('discord.js');

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
    const input = interaction.options.getString('input');
    const mediaType = interaction.options.getSubcommand();
    const queue = interaction.client.queueHandler.getQueue(interaction);

    queue.play(interaction, input, mediaType);
  },
};
