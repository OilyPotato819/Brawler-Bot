const fs = require('fs');
const { joinVoiceChannel, createAudioResource, createAudioPlayer } = require('@discordjs/voice');
const ffmpeg = require('ffmpeg');

module.exports = {
   name: 'listen',
   description: 'listen to users in vc',
   async execute(message, args) {
      let connection = joinVoiceChannel({
         channelId: message.member.voice.channel.id,
         guildId: message.guild.id,
         adapterCreator: message.guild.voiceAdapterCreator,
         selfDeaf: false,
      });

      let player = createAudioPlayer();

      const audio = connection.receiver.subscribe(message.author.id);

      let resource = createAudioResource(audio);

      player.play(resource);

      console.log(player);
   },
};
