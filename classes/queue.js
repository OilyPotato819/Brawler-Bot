const ytdl = require('ytdl-core');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource } = require('@discordjs/voice');

module.exports = {
   Queue: class {
      constructor(vc, client) {
         this.client = client;
         this.vc = vc;
         this.player = createAudioPlayer();
         this.songs = [];

         this.createEventListeners();
      }

      createEventListeners() {
         this.player.on('stateChange', (oldState, newState) => {
            if (newState.status == 'idle') {
               this.songs.splice(0, 1);
               if (this.songs.length > 0) this.play();

               console.log(this.songs);
            }
         });
      }

      add(youtubeId) {
         this.songs.push(youtubeId);
         this.join();
         if (this.songs.length == 1) this.play();
      }

      play() {
         const stream = createAudioResource(ytdl(`http://www.youtube.com/watch?v=${this.songs[0]}`, { filter: 'audioonly' }));
         this.player.play(stream);
      }

      join() {
         const vcClient = this.client.voice.channel;
         if (vcClient != this.vc) {
            if (vcClient) this.connection.destroy();

            this.connection = joinVoiceChannel({
               channelId: this.vc.id,
               guildId: this.vc.guild.id,
               adapterCreator: this.vc.guild.voiceAdapterCreator,
               selfDeaf: false,
            });

            this.connection.subscribe(this.player);
         }
      }
   },
};
