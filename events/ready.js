const { Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
   name: Events.ClientReady,
   once: true,
   execute(client) {
      console.log(`Logged in as ${client.user.tag}`);
   },
};
