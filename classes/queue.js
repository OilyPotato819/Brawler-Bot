const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');

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
            }
         });
      }

      add(youtubeLink) {
         this.songs.push(youtubeLink);
         this.join();
         if (this.songs.length == 1) this.play();
      }

      async play() {
         const stream = await play.stream(this.songs[0]);
         let resource = createAudioResource(stream.stream, {
            inputType: stream.type,
         });
         this.player.play(resource);
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

      async search(query) {
         const youtubeResults = await play
            .search(query, {
               limit: 5,
            })
            .catch(() => {
               return interaction.reply({ content: 'error searching youtube', ephemeral: true });
            });

         if (youtubeResults.length == 0) return interaction.reply({ content: 'no results found', ephemeral: true });

         return youtubeResults;
      }
   },
};
