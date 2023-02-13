const { joinVoiceChannel } = require("@discordjs/voice");
const { createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const play = require("play-dl");

module.exports = {
  Queue: class {
    constructor(vc, client) {
      this.client = client;
      this.vc = vc;
      this.player = createAudioPlayer();
      this.songs = [];
      this.playing = "nothing";

      this.createEventListeners();
    }

    createEventListeners() {
      this.player.on("stateChange", (_oldState, newState) => {
        if (newState.status == "idle") {
          if (this.songs.length > 0) {
            this.play();
            this.playing = this.songs[0].title;
          } else {
            this.playing = "nothing";
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
      if (this.playing == "nothing") {
        this.play();
        this.playing = this.songs[0].title;
      }
    }

    async play() {
      const stream = await play.stream(this.songs[0].url);
      let resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });
      this.songs.splice(0, 1);
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
            content: "error searching youtube",
            ephemeral: true,
          });
        });

      if (youtubeResults.length == 0)
        return interaction.reply({
          content: "no results found",
          ephemeral: true,
        });

      return youtubeResults;
    }

    skip(interaction) {
      if (!this.playing) {
        return interaction.reply({
          content: "queue is empty",
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
      if (this.player.state.status == "playing") {
        interaction.reply("player is now paused");
      } else {
        interaction.reply({
          content: "player is already paused",
          ephemeral: true,
        });
      }
    }

    viewQueue(interaction) {
      let string = "nothing in queue";

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
