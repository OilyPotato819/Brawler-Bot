const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('remove specific songs using indexes')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('single')
        .setDescription('remove one song from the queue')
        .addIntegerOption((option) =>
          option
            .setName('index')
            .setDescription('index of the song you want to remove')
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('range')
        .setDescription('remove an inclusive range of songs from the queue')
        .addIntegerOption((option) =>
          option
            .setName('start')
            .setDescription('starting index of the range')
            .setRequired(true)
            .setMinValue(1)
        )
        .addIntegerOption((option) =>
          option.setName('end').setDescription('last index in the range').setRequired(true).setMinValue(1)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const queue = interaction.client.queueHandler.getQueue(interaction);
    let index;
    if (subcommand === 'single') {
      index = interaction.options.getInteger('index');
    } else if (subcommand === 'range') {
      index = [interaction.options.getInteger('start'), interaction.options.getInteger('end')];
    }

    if (!queue) return;

    queue.remove(index, interaction);
  },
};
