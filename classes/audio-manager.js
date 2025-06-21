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
      const next = this.queue.next();

      if (next) {
        this.streamAudio(next);
      } else {
        this.playing = null;
      }
    });
  }

  play(videos) {
    if (!Array.isArray(videos)) {
      videos = [videos];
    }

    if (!videos.length) return;

    if (this.playing) {
      this.queue.add(videos);
      return;
    }

    this.streamAudio(videos[0]);

    if (videos.length > 1) this.queue.add(videos.slice(1));
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

  streamAudio(video) {
    this.playing = video;

    const stream = ytdl.exec(video.url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: '-',
    });

    const resource = createAudioResource(stream.stdout);
    this.player.play(resource);
  }

  inVC(id) {
    return id === this.connection?.joinConfig.channelId;
  }
}

module.exports = AudioManager;
