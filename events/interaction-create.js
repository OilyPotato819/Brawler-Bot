const { Events } = require('discord.js');
const { CustomError } = require('../messages.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);

      let message;
      if (error instanceof CustomError) {
        message = error.messageObject;
      } else {
        message = {
          content: 'There was an error while executing this command!',
          ephemeral: true,
        };
      }

      if (interaction.replied) {
        interaction.editReply(message);
      } else {
        interaction.reply(message);
      }
    }
  },
};
