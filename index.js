// const { deleteCommands } = require('./deploy-commands');
// deleteCommands();

const { deployCommands } = require('./deploy-commands');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const AudioManagerRegistry = require('./classes/audio-manager-registry.js');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

if (!fs.existsSync('.env')) throw new Error('missing .env file');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
const token = process.env.TOKEN;
client.commands = new Collection();

client.audioManagerRegistry = new AudioManagerRegistry();

deployCommands();

// Command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

// Event files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token).catch(() => {
  console.error('invalid token');
});
