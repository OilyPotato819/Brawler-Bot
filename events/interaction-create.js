const { Events } = require('discord.js');
const { messageFactory, ErrorMessage } = require('../messages.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    let message;
    try {
      message = await command.execute(interaction);
    } catch (error) {
      console.error(error);
      message =
        error instanceof ErrorMessage
          ? error.messageObject
          : messageFactory.genericError();
    }

    if (!message) {
      return;
    } else if (interaction.replied || interaction.deferred) {
      interaction.editReply(message);
    } else {
      interaction.reply(message);
    }
  },
};
