const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('toggle looping for things')
    .addSubcommand((subcommand) =>
      subcommand.setName('current').setDescription('toggle looping the currently playing track')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('each')
        .setDescription('number of times each track should loop')
        .addIntegerOption((option) =>
          option
            .setName('loop-number')
            .setDescription(
              'number of times each song should loop, where 0 means it just plays once'
            )
            .setMinValue(0)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('all').setDescription('toggle looping everything')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('off').setDescription('turn all looping off')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const loopNumber = interaction.options.getInteger('loop-number');
    const queue = interaction.client.queueHandler.getQueue(interaction);

    if (subcommand === 'current') {
      queue.loopCurrent(interaction);
    } else if (subcommand === 'all') {
      queue.loopAll(interaction);
    } else if (subcommand === 'each') {
      queue.loopEach(loopNumber, interaction);
    } else if (subcommand === 'off') {
      queue.loopOff(interaction);
    }
  },
};
