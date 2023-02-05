const { Queue } = require('./queue.js');

module.exports = {
   QueueHandler: class {
      constructor() {
         this.queues = new Map();
      }

      getQueue(interaction) {
         const guildId = interaction.guildId;
         const vc = interaction.member.voice.channel;
         const client = interaction.client;

         if (!vc) {
            interaction.editReply({
               content: `you must be in a vc to add to queue`,
               components: [],
               embeds: [],
            });
         }

         if (!this.queues.get(guildId)) {
            this.queues.set(guildId, new Queue(vc, client));
         }

         return this.queues.get(guildId);
      }
   },
};
