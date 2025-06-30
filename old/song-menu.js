const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');

class SongMenu {
  constructor(mainInteraction, youtubeResults) {
    this.mainInteraction = mainInteraction;
    this.client = mainInteraction.client;
    this.query = mainInteraction.options.getString('input');
    this.youtubeResults = youtubeResults;
    this.resultNum = youtubeResults.length;

    this.sendList();
    this.createCollector();
  }

  async sendList() {
    const fields = [];
    for (let i = 0; i < this.resultNum; i++) {
      const result = this.youtubeResults[i];
      fields.push({
        name: ' ',
        value: `**${i + 1}.** [${result.title}](<${result.url}>) (${
          result.durationRaw || `${result.videoCount} videos`
        })\n*${result.channel.name}*`,
      });
    }

    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setTitle(`Search results for *${this.query}*`)
      .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      .setAuthor({
        name: this.client.user.username,
        iconURL: this.client.user.avatarURL(),
      })
      .addFields(...fields);

    const row1 = new ActionRowBuilder();

    for (let i = 0; i < this.resultNum; i++) {
      const id = i.toString();
      const label = (i + 1).toString();

      row1.addComponents(
        new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Primary)
      );
    }

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('view').setLabel('View Videos').setStyle(ButtonStyle.Primary)
    );

    this.mainInteraction.reply({
      components: [row1, row2],
      embeds: [embed],
    });
  }

  viewVideos() {
    const songMenu = this;

    this.videoView = {
      currentPage: 0,
      actionRow: new ActionRowBuilder(),
      content: [],

      updatePage: function (addend, componentIndex, limit, buttonInteraction) {
        buttonInteraction.deferUpdate();
        this.currentPage += addend;

        if (this.currentPage === limit) {
          this.actionRow.components[componentIndex].setDisabled();
        }
        this.actionRow.components[2 - componentIndex].setDisabled(false);

        songMenu.mainInteraction.editReply({
          content: this.content[this.currentPage],
          components: [this.actionRow],
        });
      },
    };

    this.videoView.actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId('back')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⏪')
        .setDisabled()
    );
    this.videoView.actionRow.addComponents(
      new ButtonBuilder().setCustomId('play').setStyle(ButtonStyle.Primary).setEmoji('▶')
    );
    this.videoView.actionRow.addComponents(
      new ButtonBuilder().setCustomId('forward').setStyle(ButtonStyle.Primary).setEmoji('⏩')
    );

    for (let i = 0; i < this.resultNum; i++) {
      this.videoView.content.push(`**${i + 1}/${this.resultNum}**\n${this.youtubeResults[i].url}`);
    }

    this.mainInteraction.editReply({
      content: this.videoView.content[0],
      components: [this.videoView.actionRow],
      embeds: [],
    });
  }

  async createCollector() {
    const message = await this.mainInteraction.fetchReply();
    let played = false;

    this.collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    this.collector.on('end', () => {
      if (!played) message.delete().catch(() => {});
    });

    this.collector.on('collect', (buttonInteraction) => {
      const customId = buttonInteraction.customId;
      const queue = this.client.queueHandler.getQueue(this.mainInteraction);

      if (!isNaN(customId)) {
        const video = this.youtubeResults[+customId];
        queue.add(video, this.mainInteraction);
        played = true;
      } else if (customId == 'view') {
        buttonInteraction.deferUpdate();
        this.viewVideos();
      } else if (customId == 'back') {
        this.videoView.updatePage(-1, 0, 0, buttonInteraction);
      } else if (customId == 'forward') {
        this.videoView.updatePage(1, 2, 4, buttonInteraction);
      } else if (customId == 'play') {
        const video = this.youtubeResults[this.videoView.currentPage];
        queue.add(video, this.mainInteraction);
        played = true;
      }

      this.collector.resetTimer();
    });
  }
}

module.exports = { SongMenu };
