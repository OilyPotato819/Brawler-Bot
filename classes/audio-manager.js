const { spawn } = require('child_process');
const Queue = require('./queue.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
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

  play(videoArray) {
    if (!videoArray.length) return;

    if (this.playing) {
      this.queue.add(videoArray);
      return;
    }

    this.streamAudio(videoArray[0]);

    if (videoArray.length > 1) this.queue.add(videoArray.slice(1));
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

  skip() {
    const skipped = this.playing;
    this.player.stop();
    this.playing = null;

    return skipped;
  }

  streamAudio(video) {
    this.playing = video;

    const subprocess = spawn('yt-dlp', [
      video.url,
      '--quiet',
      '--format',
      'bestaudio[ext=webm][acodec=opus]',
      '--output',
      '-',
    ]);

    const resource = createAudioResource(subprocess.stdout, {
      inputType: StreamType.WebmOpus,
    });
    this.player.play(resource);
  }

  inVC(id) {
    return id === this.connection?.joinConfig.channelId;
  }
}

module.exports = AudioManager;
