const AudioManager = require('./audio-manager.js');

class AudioManagerRegistry {
  constructor() {
    this.audioManagers = new Map();
  }

  get(guildId) {
    let audioManager = this.audioManagers.get(guildId);

    if (!audioManager) {
      audioManager = new AudioManager();
      this.audioManagers.set(guildId, audioManager);
    }

    return audioManager;
  }
}

module.exports = AudioManagerRegistry;
