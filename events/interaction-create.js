const { Events } = require('discord.js');
const { Message } = require('../messages.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const message = error.discordMessage ?? new Message('genericError');
      message.send(interaction);
    }
  },
};
