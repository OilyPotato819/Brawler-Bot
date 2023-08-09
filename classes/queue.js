const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { SongMenu } = require('./songMenu.js');
const play = require('play-dl');

module.exports = {
  Queue: class {
    constructor(client) {
      this.client = client;
      this.player = createAudioPlayer();
      this.songs = [];
      this.playing = null;
      this.loop = { current: false, all: false, each: 0, count: 0, index: null };
      this.connection = null;

      this.createEventListeners();
    }

    createEventListeners() {
      this.player.on('stateChange', (_oldState, newState) => {
        if (newState.status === 'idle') {
          if (this.playing?.loopCount >= this.loop.each && this.loop.each > 0 && !this.loop.current) {
            this.playing.loopCount = 0;
            this.playing = null;
          }

          if (this.playing?.loopCount < this.loop.each) {
            this.playing.loopCount++;
            this.play();
          } else if (this.loop.current && this.playing) {
            this.play();
          } else if (this.loop.all) {
            this.loop.index = (this.loop.index + 1) % this.songs.length;
            this.playing = this.songs[this.loop.index];
            this.play();
          } else if (this.songs.length > 0) {
            this.playing = this.songs.shift();
            this.play();
          } else {
            this.playing = null;
          }
        }
      });
    }

    checkUserVoice(interaction) {
      const vc = interaction.member.voice.channel;
      if (vc) return true;

      interaction.reply({
        content: `you must be in a vc to use this command`,
        ephemeral: true,
      });
      return false;
    }

    async add(media, interaction) {
      let videoArray;
      let content;

      if (media.type === 'playlist') {
        content = `added **${media.videoCount}** videos from [**${media.title}**](${media.url}) to queue`;

        // all_videos() doesn't work with playlists that come from play.search()
        const playlist = await play.playlist_info(media.url);
        videoArray = await playlist.all_videos();
      } else if (media.type === 'video') {
        content = `added [**${media.title}**](${media.url}) to queue`;
        videoArray = [media];
      }

      const message = {
        content: content,
        components: [],
        embeds: [],
      };

      if (interaction.replied) {
        interaction.editReply(message);
      } else {
        interaction.reply(message);
      }

      for (let i = 0; i < videoArray.length; i++) {
        videoArray[i].loopCount = 0;
      }

      this.songs.push(...videoArray);
      this.join(interaction, false);
      if (!this.playing) {
        if (!this.loop.all) {
          this.playing = this.songs.shift();
        } else {
          this.playing = this.songs[0];
        }
        this.play();
      }
    }

    async play() {
      const stream = await play.stream(this.playing.url);
      let resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      this.player.play(resource);
    }

    join(interaction, reply) {
      const clientVcId = this.connection?.packets.state.channel_id;
      const memberVoice = interaction.member.voice;

      if (memberVoice.channelId === clientVcId) {
        if (reply) {
          return interaction.reply({
            content: 'already in your call',
            ephemeral: true,
          });
        }
        return;
      }

      if (this.connection) this.connection.destroy();

      this.connection = joinVoiceChannel({
        channelId: memberVoice.channelId,
        guildId: memberVoice.guild.id,
        adapterCreator: memberVoice.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      if (reply) interaction.reply(`joined **${memberVoice.channel.name}** call`);
      this.connection.subscribe(this.player);
    }

    async search(query, subcommand, interaction) {
      const youtubeResults = await play
        .search(query, {
          limit: 5,
          source: {
            youtube: subcommand,
          },
        })
        .catch(() => {
          return interaction.reply({
            content: 'error searching youtube',
            ephemeral: true,
          });
        });

      if (youtubeResults.length === 0) {
        interaction.reply({
          content: 'no results found',
          ephemeral: true,
        });

        return null;
      }

      return youtubeResults;
    }

    async pickSong(input, subcommand, interaction) {
      if (input.startsWith('https://')) {
        if (subcommand === 'playlist') {
          const playlist = await play.playlist_info(input, { incomplete: true }).catch(badLink);
          this.add(playlist, interaction);
        } else if (subcommand === 'video') {
          const video = await play.video_basic_info(input).catch(badLink);
          this.add(video.video_details, interaction);
        }

        function badLink() {
          interaction.reply({
            content: 'not a valid link',
            ephemeral: true,
          });
        }
      } else {
        const youtubeResults = await this.search(input, subcommand, interaction);
        if (youtubeResults) interaction.songMenu = new SongMenu(interaction, youtubeResults);
      }
    }

    skip(interaction) {
      if (!this.playing) {
        return interaction.reply({
          content: 'queue is empty',
          ephemeral: true,
        });
      }

      interaction.reply(`skipped [**${this.playing.title}**](<${this.playing.url}>)`);

      this.playing.loopCount = 0;
      this.playing = null;
      this.player.stop();
    }

    np(interaction) {
      interaction.reply({
        content: `now playing **${
          this.playing ? `[${this.playing.title}](${this.playing.url})` : 'nothing'
        }**`,
        ephemeral: true,
      });
    }

    pause(interaction) {
      if (this.player.state.status === 'playing') {
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
      if (this.player.state.status === 'paused') {
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
      let string = '';

      if (this.songs.length) {
        for (let i = 0; i < this.songs.length; i++) {
          const song = this.songs[i];

          if (i > 0) {
            string += '\n';
          }

          string += `${i + 1}. [**${song.title}**](<${song.url}>) (${song.durationRaw})`;
        }
      } else {
        string = 'nothing in queue';
      }

      interaction.reply({
        content: string,
        ephemeral: true,
      });
    }

    clear(interaction) {
      this.songs = [];

      interaction.reply('cleared the queue');
    }

    remove(index, interaction) {
      if (index > this.songs.length) {
        return interaction.reply({
          content: 'not a valid index',
          ephemeral: true,
        });
      }

      let removed;
      if (index.length === 1) {
        removed = this.songs.splice(index[0] - 1, 1);
      } else {
        removed = this.songs.splice(index[0] - 1, index[1] - index[0] + 1);
      }

      interaction.reply(
        `removed **${removed.length === 1 ? removed[0].title : `${removed.length} songs`}** from queue`
      );
    }

    loopCurrent(interaction) {
      if (this.loop.current === true) {
        this.loop.current = false;
        interaction.reply('turned looping current **off**');
      } else {
        this.loop.current = true;
        interaction.reply('turned looping current **on**');
      }
    }

    loopAll(interaction) {
      if (this.loop.all === true) {
        this.loop.all = false;
        this.songs.splice(0, this.loop.index + 1);
        this.loop.index = null;
        interaction.reply('turned looping all **off**');
      } else {
        this.loop.all = true;
        this.loop.index = 0;
        if (this.playing) this.songs.unshift(this.playing);
        interaction.reply('turned looping all **on**');
      }
    }

    loopEach(loopNumber, interaction) {
      this.loop.each = loopNumber;
      interaction.reply(`each track will now loop **${loopNumber}** times`);
    }

    shuffle(interaction) {
      interaction.reply({
        content: 'this doesnt do anything yet',
        ephemeral: true,
      });
    }
  },
};
