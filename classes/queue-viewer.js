const { EmbedBuilder, ActionRowBuilder, ComponentType } = require('discord.js');

class QueueViewer {
  constructor(queue) {
    this.queue = queue;
    this.pageSize = 10;
    this.pageIndex = 0;
  }

  createMessage() {
    const pageOffset = this.pageIndex * this.pageSize;
    const maxPageNum = Math.ceil(this.queue.length / this.pageSize);
    const page = this.queue.slice(pageOffset, pageOffset + this.pageSize);

    const fields = page.map((queuedItem, i) => ({
      name: ' ',
      value: queuedItem.toQueueEntry(pageOffset + i + 1),
    }));

    const embed = new EmbedBuilder()
      .setColor(0xbfda34)
      .setTitle('Queue')
      .setDescription(`Page ${this.pageIndex + 1}/${maxPageNum}`)
      .addFields(fields);

    return { embeds: [embed], components: [row] };
  }

  displayQueue(interaction) {
    const message = this.createMessage();
    message.withResponse = true;
    const response = interaction.reply(message);

    const collector = response.resource.message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60_000,
    });

    collector.on('collect', (interaction) => {
      console.log(interaction);
      //   interaction.update(this.createMessage());
    });
  }
}
