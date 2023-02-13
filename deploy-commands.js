const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');
module.exports = { deployCommands: deployCommands, deleteCommands: deleteCommands };

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const rest = new REST({ version: '10' }).setToken(token);

function deployCommands() {
  const commands = [];
  const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(token);

  (async () => {
    try {
      console.log(`Started refreshing ${commands.length} application commands.`);
      const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log(`Successfully reloaded ${data.length} application commands.`);
    } catch (error) {
      console.error(error);
    }
  })();
}

function deleteCommands() {
  rest
    .put(Routes.applicationCommands(clientId), { body: [] })
    .then(() => console.log('Successfully deleted all application commands.'))
    .catch(console.error);
}
