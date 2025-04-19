const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');

class QueueViewer {
  constructor(mainInteraction, videos) {
    this.mainInteraction = mainInteraction;
    this.client = mainInteraction.client;

    this.sendEmbed(videos);
    this.createCollector();
  }

  sendEmbed(videos) {
    const mainInteraction = this.mainInteraction;
    const client = this.client;

    this.response = {
      currentPage: 0,
      actionRow: new ActionRowBuilder(),
      fields: [],

      updatePage: function (addend, componentIndex, limit, buttonInteraction) {
        buttonInteraction.deferUpdate();
        this.currentPage += addend;

        if (this.currentPage === limit) {
          this.actionRow.components[componentIndex].setDisabled();
        }
        this.actionRow.components[1 - componentIndex].setDisabled(false);

        mainInteraction.editReply({
          components: [this.actionRow],
          embeds: [this.createEmbed()],
          ephemeral: true,
        });
      },

      createEmbed: function () {
        return new EmbedBuilder()
          .setColor('Orange')
          .setTitle(`Queue`)
          .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
          .setAuthor({
            name: client.user.username,
            iconURL: client.user.avatarURL(),
          })
          .addFields(...this.fields[this.currentPage]);
      },
    };

    for (let i = 0; i < videos.length; i++) {
      if (i % 10 === 0) {
        this.response.fields.push([]);
      }

      const video = videos[i];
      this.response.fields[Math.floor(i / 10)].push({
        name: ' ',
        value: `**${i + 1}.** [${video.title}](<${video.url}>) (${
          video.durationRaw || `${video.videoCount} videos`
        })\n*${video.channel.name}*`,
      });
    }

    this.response.actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId('back')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('◀')
        .setDisabled()
    );
    this.response.actionRow.addComponents(
      new ButtonBuilder().setCustomId('forward').setStyle(ButtonStyle.Primary).setEmoji('▶')
    );

    const replyOptions = {
      components: [this.response.actionRow],
      embeds: [this.response.createEmbed()],
      ephemeral: true,
    };

    if (this.mainInteraction.replied) {
      this.mainInteraction.editReply(replyOptions);
    } else {
      this.mainInteraction.reply(replyOptions);
    }
  }

  async createCollector() {
    const message = await this.mainInteraction.fetchReply();

    this.collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    this.collector.on('end', () => {
      message.delete().catch(() => {});
    });

    this.collector.on('collect', (buttonInteraction) => {
      const customId = buttonInteraction.customId;

      if (customId == 'back') {
        this.response.updatePage(-1, 0, 0, buttonInteraction);
      } else if (customId == 'forward') {
        this.response.updatePage(1, 1, this.response.fields.length - 1, buttonInteraction);
      }

      this.collector.resetTimer();
    });
  }
}

module.exports = { QueueViewer };
