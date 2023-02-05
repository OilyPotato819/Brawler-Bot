const { Events } = require('discord.js');
const { Queue } = require('../classes/queue.js');
const { SongMenu } = require('../classes/songMenu.js');

module.exports = {
   name: Events.InteractionCreate,
   async execute(interaction) {
      if (!interaction.isChatInputCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);

      try {
         await command.execute(interaction);
      } catch (error) {
         console.error(error);
         await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
         });
      }
   },
};
