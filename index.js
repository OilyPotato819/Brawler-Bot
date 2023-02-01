// const { deleteCommands } = require('./deploy-commands');
// deleteCommands();

const { deployCommands } = require('./deploy-commands');
deployCommands();

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.TOKEN;
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
   const filePath = path.join(commandsPath, file);
   const command = require(filePath);
   // Set a new item in the Collection with the key as the command name and the value as the exported module
   if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
   } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
   }
}

client.on(Events.InteractionCreate, async (interaction) => {
   if (!interaction.isChatInputCommand()) return;

   const command = interaction.client.commands.get(interaction.commandName);

   if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
   }

   try {
      await command.execute(interaction);
   } catch (error) {
      console.error(error);
      await interaction.reply({
         content: 'There was an error while executing this command!',
         ephemeral: true,
      });
   }
});

client.on('ready', () => {
   console.log(`Logged in as ${client.user.tag}!`);

   let results = ['1', '2', '3', '4', '5'];
   let rows = [];

   for (let i = 0; i < results.length; i++) {
      rows.push(
         new ActionRowBuilder().addComponents(
            new ButtonBuilder()
               .setCustomId(i.toString())
               .setLabel((i + 1).toString())
               .setStyle(ButtonStyle.Primary)
         )
      );
   }

   let channel = client.channels.cache.get('964752876306055168');

   const actionRow = new ActionRowBuilder();

   actionRow.addComponents(new ButtonBuilder().setCustomId('back').setStyle(ButtonStyle.Primary).setEmoji('⏮'));
   actionRow.addComponents(new ButtonBuilder().setCustomId('play').setStyle(ButtonStyle.Primary).setEmoji('▶'));
   actionRow.addComponents(new ButtonBuilder().setCustomId('forward').setStyle(ButtonStyle.Primary).setEmoji('⏭'));

   channel.send({ content: 'https://www.youtube.com/watch?v=p0BkfX2Twdc', components: [actionRow] });
});

client.login(token);
