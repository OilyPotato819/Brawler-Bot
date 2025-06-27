const { SlashCommandBuilder } = require('discord.js');
const { messageFactory } = require('../messages.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('remove videos from the queue using their indexes')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('one')
        .setDescription('remove one video')
        .addIntegerOption((option) =>
          option
            .setName('index')
            .setDescription('index of the video')
            .setRequired(true)
            .setMinValue(0)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('range')
        .setDescription('remove an inclusive range of videos')
        .addIntegerOption((option) =>
          option
            .setName('start')
            .setDescription('starting index of the range')
            .setRequired(true)
            .setMinValue(0)
        )
        .addIntegerOption((option) =>
          option.setName('end').setDescription('ending index of the range').setMinValue(0)
        )
    ),
  async execute(interaction) {
    const options = interaction.options;
    const audioManager = interaction.client.audioManagerRegistry.get(interaction.guildId);
    const queue = audioManager.queue;

    let start;
    let end;
    switch (options.getSubcommand()) {
      case 'one':
        start = options.getInteger('index');
        end = start;
        break;
      case 'range':
        start = options.getInteger('start');
        end = options.getInteger('end') ?? queue.length();
        break;
    }

    if (start > end || start > queue.length() || end > queue.length()) {
      return messageFactory.invalidRange();
    }

    let deleteCount = end - start + 1;
    let skipped;
    if (start === 0) {
      skipped = audioManager.skip();
      deleteCount--;
    } else {
      start--;
    }

    queue.remove(start, deleteCount);
    return messageFactory.remove(skipped?.title, deleteCount);
  },
};
