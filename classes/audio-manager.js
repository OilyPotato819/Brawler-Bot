const ytdl = require('youtube-dl-exec');
const Queue = require('./queue.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');

class AudioManager {
  constructor() {
    this.queue = new Queue();
    this.player = createAudioPlayer();
    this.playing = null;
    this.connection = null;
    this.createListeners();
  }

  createListeners() {
    this.player.on(AudioPlayerStatus.Idle, () => {
      const nextVideo = this.queue.nextVideo();

      if (nextVideo) {
        this.playing = nextVideo;
        this.playURL(nextVideo.url);
      } else {
        this.playing = null;
      }
    });

    this.queue.on('queueStarted', () => {
      if (!this.playing) {
        this.playing = this.queue.nextVideo();
        this.playURL(this.playing.url);
      }
    });
  }

  join(channel) {
    if (this.connection) this.connection.destroy();

    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    this.connection.subscribe(this.player);
  }

  playURL(url) {
    const stream = ytdl.exec(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: '-',
    });

    const resource = createAudioResource(stream.stdout);

    this.player.play(resource);
  }

  inVoiceChannel(id) {
    return id === this.connection?.joinConfig.channelId;
  }
}

module.exports = AudioManager;
