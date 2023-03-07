const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { SongMenu } = require('./songMenu.js');
const play = require('play-dl');

module.exports = {
  Queue: class {
    constructor(vc, client) {
      this.client = client;
      this.vc = vc;
      this.player = createAudioPlayer();
      this.songs = [];
      this.playing = null;
      this.looping = false;

      this.createEventListeners();
    }

    createEventListeners() {
      this.player.on('stateChange', (_oldState, newState) => {
        if (newState.status == 'idle') {
          if (this.looping) {
            this.play();
          } else if (this.songs.length > 0) {
            this.play();
          } else {
            this.playing = null;
          }
        }
      });
    }

    add(youtubeVideo, interaction) {
      const message = {
        content: `added **${youtubeVideo.url}** to queue`,
        components: [],
        embeds: [],
      };

      if (interaction.replied) {
        interaction.editReply(message);
      } else {
        interaction.reply(message);
      }

      this.songs.push(youtubeVideo);
      this.join();
      if (!this.playing) {
        this.play();
      }
    }

    async play(looping) {
      const stream = await play.stream(this.songs[0].url);
      let resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });
      if (!this.looping) this.playing = this.songs.shift();
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
          return interaction.reply({
            content: 'error searching youtube',
            ephemeral: true,
          });
        });

      if (youtubeResults.length == 0)
        return interaction.reply({
          content: 'no results found',
          ephemeral: true,
        });

      return youtubeResults;
    }

    async pickSong(input, interaction) {
      if (input.startsWith('https://')) {
        const video = await play.video_basic_info(input).catch(() => {
          interaction.reply({
            content: 'not a valid youtube link',
            ephemeral: true,
          });
        });

        if (video) this.add(video.video_details, interaction);
      } else {
        const youtubeResults = await this.search(input);
        interaction.songMenu = new SongMenu(interaction, youtubeResults);
      }
    }

    skip(interaction) {
      if (!this.playing) {
        return interaction.reply({
          content: 'queue is empty',
          ephemeral: true,
        });
      }

      interaction.reply(`skipped **${this.playing}**`);

      this.player.stop();
    }

    np(interaction) {
      interaction.reply({
        content: `now playing **${this.playing}**`,
        ephemeral: true,
      });
    }

    pause(interaction) {
      if (this.player.state.status == 'playing') {
        this.player.pause();
        interaction.reply('player is now paused');
      } else {
        interaction.reply({
          content: 'player is not currently playing',
          ephemeral: true,
        });
      }
    }

    unpause(interaction) {
      if (this.player.state.status == 'paused') {
        this.player.unpause();
        interaction.reply('player is now unpaused');
      } else {
        interaction.reply({
          content: 'player is not currently paused',
          ephemeral: true,
        });
      }
    }

    viewQueue(interaction) {
      let string = 'nothing in queue';

      if (this.songs.length) {
        string = `1. **${this.songs[0].title}**`;
        for (let i = 1; i < this.songs.length; i++) {
          string += `\n ${i + 1}. **${this.songs[i].title}**`;
        }
      }

      interaction.reply({
        content: string,
        ephemeral: true,
      });
    }
  },
};
