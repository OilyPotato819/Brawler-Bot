const fs = require('fs');
const { joinVoiceChannel, createAudioResource, createAudioPlayer } = require('@discordjs/voice');
const Meyda = require('meyda');

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

      // let player = createAudioPlayer();

      const audio = connection.receiver.subscribe('465298168675041300');

      audio.on('data', (opusPacket) => {
         connection.playOpusPacket(opusPacket);
      });

      // let resource = createAudioResource(audio);

      // player.play(resource);

      // console.log(player);
   },
};
