const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const { SongMenu } = require('./songMenu.js');
const { QueueViewer } = require('./queueViewer.js');
const play = require('play-dl');

module.exports = {
  Queue: class {
    constructor(client) {
      this.client = client;
      this.player = createAudioPlayer();
      this.videos = [];
      this.playing = null;
      this.loop = { current: false, all: false, each: 0 };
      this.shuffleVideos = [];
      this.connection = null;

      this._createEventListeners();
    }

    _createEventListeners() {
      this.player.on('stateChange', (_oldState, newState) => {
        if (newState.status === 'idle') {
          if (this.playing?.loopCount >= this.loop.each && this.loop.each && !this.loop.current) {
            this.playing.loopCount = 0;
            this.playing = null;
          }

          if (this.playing?.loopCount < this.loop.each) {
            this.playing.loopCount++;
            this._play();
          } else if (this.loop.current && this.playing) {
            this._play();
          } else if (this.loop.all) {
            this.playing = this.videos.shift();
            this.videos.push(this.playing);
            this._play();
          } else if (this.shuffleVideos.length && !this.videos.length) {
            this._shuffleQueue();
            this.playing = this.videos.shift();
            this._play();
          } else if (this.videos.length) {
            this.playing = this.videos.shift();
            this._play();
          } else {
            this.playing = null;
          }
        }
      });
    }

    async _play() {
      const stream = await play.stream(this.playing.url);
      let resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      this.player.play(resource);
    }

    async _search(query, subcommand, interaction) {
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

    _shuffleQueue() {
      let newVideos = [];
      const indexes = [...Array(this.shuffleVideos.length).keys()];

      while (indexes.length) {
        const randomIndex = Math.floor(Math.random() * indexes.length);
        newVideos.push(this.shuffleVideos[indexes[randomIndex]]);
        indexes.splice(randomIndex, 1);
      }

      this.videos = newVideos;
    }

    _skipSong() {
      this.playing.loopCount = 0;
      this.playing = null;
      this.player.stop();
    }

    async add(media, interaction) {
      let videoArray;
      let content;

      if (media.type === 'playlist') {
        content = `added **${media.videoCount}** videos from [**${media.title}**](${media.url}) to queue`;

        // all_videos() doesn't work with playlists that come from play._search()
        const playlist = await play.playlist_info(media.url, { incomplete: true });
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

      this.videos.push(...videoArray);
      this.join(interaction, false);
      if (!this.playing) {
        if (!this.loop.all) {
          this.playing = this.videos.shift();
        } else {
          this.playing = this.videos[0];
        }
        this._play();
      }
    }

    clear(interaction) {
      this.videos = [];
      this.loop.all = false;
      this.loop.current = false;
      this.loop.each = 0;
      this.shuffleVideos = [];
      this._skipSong();

      interaction.reply('cleared the queue');
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

    loopAll(interaction) {
      if (!this.loop.all) {
        if (this.shuffleVideos.length) {
          this.videos = this.shuffleVideos;
          this.shuffleVideos = [];
          this.playing = this.videos.shift();
        }

        this.loop.all = true;
        if (this.playing) this.videos.unshift(this.playing);
        interaction.reply('turned looping all **on**');
      } else {
        this.loop.all = false;
        interaction.reply('turned looping all **off**');
      }
    }

    loopCurrent(interaction) {
      if (!this.loop.current) {
        this.loop.current = true;
        interaction.reply('turned looping current **on**');
      } else {
        this.loop.current = false;
        interaction.reply('turned looping current **off**');
      }
    }

    loopEach(loopNumber, interaction) {
      this.loop.each = loopNumber;
      interaction.reply(`each track will now loop **${loopNumber}** times`);
    }

    loopOff(interaction) {
      this.loop.all = false;
      this.loop.current = false;
      this.loop.each = 0;
      interaction.reply('turned all looping off');
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

    checkUserVoice(interaction) {
      const vc = interaction.member.voice.channel;
      if (vc) return true;

      interaction.reply({
        content: `you must be in a vc to use this command`,
        ephemeral: true,
      });
      return false;
    }

    async pickSong(input, subcommand, interaction) {
      if (input.startsWith('https://')) {
        if (subcommand === 'playlist') {
          const playlist = await play.playlist_info(input, { incomplete: true }).catch(() => {
            return 'badlink';
          });

          if (playlist === 'badlink') return badLink();
          if (!playlist) return loadError();

          this.add(playlist, interaction);
        } else if (subcommand === 'video') {
          const video = await play.video_basic_info(input).catch((err) => {
            console.error(err);
            return 'badlink';
          });

          if (video === 'badlink') return badLink();
          if (!video) return loadError();

          this.add(video.video_details, interaction);
        }

        function badLink() {
          interaction.reply({
            content: 'not a valid link',
            ephemeral: true,
          });
        }

        function loadError() {
          interaction.reply({
            content: 'error loading this video',
            ephemeral: true,
          });
        }
      } else {
        const youtubeResults = await this._search(input, subcommand, interaction);
        if (youtubeResults) interaction.songMenu = new SongMenu(interaction, youtubeResults);
      }
    }

    remove(index, interaction) {
      const videos = this.videos;
      function goodIndex(checkIndex) {
        return checkIndex <= videos.length;
      }

      const isArray = Array.isArray(index);
      const checkArray = isArray && goodIndex(index[0]) && goodIndex(index[1]) && index[0] < index[1];
      const checkVar = !isArray && goodIndex(index);

      if (!checkArray && !checkVar) {
        return interaction.reply({
          content: 'not a valid index',
          ephemeral: true,
        });
      }

      let removed;
      if (isArray) {
        if (index[0] === 0) {
          removed = [this.playing, ...this.videos.splice(0, index[1])];
          this._skipSong();
        } else {
          removed = this.videos.splice(index[0] - 1, index[1] - (index[0] - 1));
        }

        if (this.shuffleVideos.length) {
          for (const video of removed) {
            index = this.shuffleVideos.indexOf(video);
            this.shuffleVideos.splice(index, 1);
          }
        }
      } else {
        if (index === 0) {
          removed = this.playing;
          this._skipSong();
        } else {
          [removed] = this.videos.splice(index - 1, 1);
        }

        if (this.shuffleVideos.length) {
          index = this.shuffleVideos.indexOf(removed);
          this.shuffleVideos.splice(index, 1);
        }
      }

      interaction.reply(`removed **${isArray ? `${removed.length} songs` : removed.title}** from queue`);
    }

    shuffle(interaction) {
      if (this.shuffleVideos.length === 0 && this.videos.length) {
        if (this.loop.all) {
          this.loop.all = false;
          this.playing = this.videos.shift();
        }
        this.shuffleVideos = this.videos;
        this._shuffleQueue();
        if (this.playing) this.shuffleVideos.unshift(this.playing);

        interaction.reply('turned shuffle **on**');
      } else if (this.videos.length) {
        this.shuffleVideos = [];
        interaction.reply('turned shuffle **off**');
      } else {
        return interaction.reply({
          content: 'queue is empty',
          ephemeral: true,
        });
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
      this._skipSong();
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
      if (this.videos.length) {
        if (this.videos.length > 10) {
          return new QueueViewer(interaction, this.videos);
        }

        const fields = [];
        for (let i = 0; i < this.videos.length; i++) {
          const video = this.videos[i];
          fields.push({
            name: ' ',
            value: `**${i + 1}.** [${video.title}](<${video.url}>) (${
              video.durationRaw || `${video.videoCount} videos`
            })\n*${video.channel.name}*`,
          });
        }

        const embed = new EmbedBuilder()
          .setColor('Orange')
          .setTitle('Queue')
          .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
          .setAuthor({
            name: this.client.user.username,
            iconURL: this.client.user.avatarURL(),
          })
          .addFields(...fields);

        interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: 'nothing in queue',
          ephemeral: true,
        });
      }
    }
  },
};
