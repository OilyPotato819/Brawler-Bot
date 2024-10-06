const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');

const token = process.env.TOKEN
const clientId = process.env.CLIENT_ID
const rest = new REST().setToken(token);

function deployCommands() {
  const commands = [];
  const commandFiles = fs.readdirSync('./commands');

  for (const file of commandFiles) {
    const filePath = `./commands/${file}`
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
  }

  (async () => {
      console.log(`Started refreshing ${commands.length} application commands.`);
      const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log(`Successfully reloaded ${data.length} application commands.`);
  })();
}

function deleteCommands() {
  rest
    .put(Routes.applicationCommands(clientId), { body: [] })
    .then(() => console.log('Successfully deleted all application commands.'))
    .catch(console.error);
}

module.exports = { deployCommands: deployCommands, deleteCommands: deleteCommands };