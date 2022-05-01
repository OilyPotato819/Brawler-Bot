const Discord = require('discord.js');
const fs = require('fs');
const { joinVoiceChannel } = require('@discordjs/voice');
const { Player } = require('discord-player');
require('dotenv').config();

const CLIENT_ID = '963636924646576128';
const GUILD_ID = '785682503968096276';

global.client = new Discord.Client({
   intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_MEMBERS'],
});

client.login(process.env.DISCORD_TOKEN);

client.prefix = '!';

client.commands = new Discord.Collection();

const commandFiles = fs
   .readdirSync('./commands/')
   .filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
   const command = require(`./commands/${file}`);

   client.commands.set(command.name, command);
}

client.once('ready', () => {
   console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
   if (!message.content.startsWith(client.prefix) || message.author.bot) return;

   global.player = new Player(client);

   const args = message.content.slice(client.prefix.length).split(/ +/);
   const command = args.shift().toLowerCase();

   const cmd =
      client.commands.get(command) ||
      client.commands.find(
         (cmd) => cmd.aliases && cmd.aliases.includes(command)
      );

   if (cmd) {
      cmd.execute(message, args);
   } else {
      message.reply('not a command stupid');
   }
});

// const a = new Player(client)
// a.
// const queue = a.createQueue()
// queue.
