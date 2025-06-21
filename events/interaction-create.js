const { Events } = require('discord.js');
const { messageFactory, ErrorMessage } = require('../messages.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);

      const message =
        error instanceof ErrorMessage ? error.messageObject : messageFactory.genericError();

      if (interaction.replied) {
        interaction.editReply(message);
      } else {
        interaction.reply(message);
      }
    }
  },
};
