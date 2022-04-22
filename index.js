const Discord = require('discord.js');
const fs = require('fs');
const { joinVoiceChannel } = require('@discordjs/voice');
const { Player } = require('discord-player');
require('dotenv').config();

const CLIENT_ID = '963636924646576128';
const GUILD_ID = '785682503968096276';

const client = new Discord.Client({
    intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'GUILD_VOICE_STATES'
    ]
});

client.login(process.env.DISCORD_TOKEN);

const prefix = '!';

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
    cageChannel = client.channels.cache.get('964690435727577158');
});

client.on('messageCreate', (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    const voiceChannel = message.member.voice.channel;
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guildId,
        adapterCreator: message.guild.voiceAdapterCreator,
    });

    if (command == 'play' || command == 'p') {
        client.commands.get('play').execute(message, args, connection);
    } else if (command == 'pause') {
        client.commands.get('pause').execute(message);
    } else if (command == 'punch') {
        client.commands.get('punch').execute(message, connection);
    } else if (command == 'hello' || command == 'hey' || command == 'hi') {
        client.commands.get('greeting').execute(message);
    } else if (command == 'unpause') {
        client.commands.get('unpause').execute(message);
    } else if (command == 'leave') {
        client.commands.get('leave').execute(message, connection);
    }
});
