const { Queue } = require('./queue.js');

module.exports = {
  QueueHandler: class {
    constructor() {
      this.queues = new Map();
    }

    getQueue(interaction) {
      const guildId = interaction.guildId;
      const client = interaction.client;

      if (!this.queues.get(guildId)) {
        this.queues.set(guildId, new Queue(client));
      }

      return this.queues.get(guildId);
    }
  },
};
