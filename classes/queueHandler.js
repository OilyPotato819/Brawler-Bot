const { Queue } = require('./queue.js');

class QueueHandler {
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
}

module.exports = { QueueHandler };
