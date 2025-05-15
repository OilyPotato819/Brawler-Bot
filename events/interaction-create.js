const { Events } = require('discord.js');
const { messages, ErrorMessage } = require('../messages.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);

      const message = error instanceof ErrorMessage ? error.messageObject : messages.genericError();

      if (interaction.replied) {
        interaction.editReply(message);
      } else {
        interaction.reply(message);
      }
    }
  },
};
