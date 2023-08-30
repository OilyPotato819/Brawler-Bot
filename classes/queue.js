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
            this.loop.index = (this.loop.index + 1) % this.videos.length;
            this.playing = this.videos[this.loop.index];
            this.play();
          } else if (this.videos.length > 0) {
            this.playing = this.videos.shift();
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

      this.videos.push(...videoArray);
      this.join(interaction, false);
      if (!this.playing) {
        if (!this.loop.all) {
          this.playing = this.videos.shift();
        } else {
          this.playing = this.videos[0];
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
          if (!playlist) badLink();
          this.add(playlist, interaction);
        } else if (subcommand === 'video') {
          const video = await play.video_basic_info(input).catch(badLink);
          if (!video) badLink();
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

    clear(interaction) {
      this.videos = [];

      interaction.reply('cleared the queue');
    }

    remove(index, interaction) {
      if (index > this.videos.length) {
        return interaction.reply({
          content: 'not a valid index',
          ephemeral: true,
        });
      }

      let removed;
      if (index.length === 1) {
        removed = this.videos.splice(index[0] - 1, 1);
      } else {
        removed = this.videos.splice(index[0] - 1, index[1] - index[0] + 1);
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
        this.videos.splice(0, this.loop.index + 1);
        this.loop.index = null;
        interaction.reply('turned looping all **off**');
      } else {
        this.loop.all = true;
        this.loop.index = 0;
        if (this.playing) this.videos.unshift(this.playing);
        interaction.reply('turned looping all **on**');
      }
    }

    loopEach(loopNumber, interaction) {
      this.loop.each = loopNumber;
      interaction.reply(`each track will now loop **${loopNumber}** times`);
    }

    loopOff(interaction) {
      this.loop.each = 0;
      this.loop.all = false;
      this.loop.current = false;
      interaction.reply('turned all looping off');
    }

    shuffle(interaction) {
      interaction.reply({
        content: 'this doesnt do anything yet',
        ephemeral: true,
      });
    }
  },
};
