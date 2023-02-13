const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');

module.exports = {
  SongMenu: class {
    constructor(initialInter, youtubeResults) {
      this.initialInter = initialInter;
      this.client = initialInter.client;
      this.query = initialInter.options.getString('input');
      this.youtubeResults = youtubeResults;

      this.sendList();
      this.createCollector();
    }

    async sendList() {
      const embed = new EmbedBuilder()
        .setTitle(`Search results for *${this.query}*`)
        .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setAuthor({
          name: this.client.user.username,
          iconURL: this.client.user.avatarURL(),
        })
        .addFields(
          {
            name: ' ',
            value: `**1.** ${this.youtubeResults[0].title} (${this.youtubeResults[0].durationRaw}) \n *${this.youtubeResults[0].channel.name}*`,
          },
          {
            name: ' ',
            value: `**2.** ${this.youtubeResults[1].title} (${this.youtubeResults[0].durationRaw}) \n *${this.youtubeResults[1].channel.name}*`,
          },
          {
            name: ' ',
            value: `**3.** ${this.youtubeResults[2].title} (${this.youtubeResults[0].durationRaw}) \n *${this.youtubeResults[2].channel.name}*`,
          },
          {
            name: ' ',
            value: `**4.** ${this.youtubeResults[3].title} (${this.youtubeResults[0].durationRaw}) \n *${this.youtubeResults[3].channel.name}*`,
          },
          {
            name: ' ',
            value: `**5.** ${this.youtubeResults[4].title} (${this.youtubeResults[0].durationRaw}) \n *${this.youtubeResults[4].channel.name}*`,
          }
        );

      const row1 = new ActionRowBuilder();

      for (let i = 0; i < 5; i++) {
        const id = i.toString();
        const label = (i + 1).toString();

        row1.addComponents(new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Primary));
      }

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('view').setLabel('View Videos').setStyle(ButtonStyle.Primary)
      );

      await this.initialInter.reply({
        components: [row1, row2],
        embeds: [embed],
      });
    }

    viewVideos() {
      const songMenu = this;

      this.videoView = {
        currentPage: 0,
        actionRow: new ActionRowBuilder(),

        updatePage: function (num, i, limit, buttonInter) {
          buttonInter.deferUpdate();
          this.currentPage += num;

          if (this.currentPage == limit) {
            this.actionRow.components[i].setDisabled();
          }
          this.actionRow.components[2 - i].setDisabled(false);

          songMenu.initialInter.editReply({
            content: this.content[this.currentPage],
            components: [this.actionRow],
          });
        },
      };

      this.videoView.actionRow.addComponents(
        new ButtonBuilder().setCustomId('back').setStyle(ButtonStyle.Primary).setEmoji('⏮').setDisabled()
      );
      this.videoView.actionRow.addComponents(
        new ButtonBuilder().setCustomId('play').setStyle(ButtonStyle.Primary).setEmoji('▶')
      );
      this.videoView.actionRow.addComponents(
        new ButtonBuilder().setCustomId('forward').setStyle(ButtonStyle.Primary).setEmoji('⏭')
      );

      this.videoView.content = [
        `**1/5** \n ${this.youtubeResults[0].url}`,
        `**2/5** \n ${this.youtubeResults[1].url}`,
        `**3/5** \n ${this.youtubeResults[2].url}`,
        `**4/5** \n ${this.youtubeResults[3].url}`,
        `**5/5** \n ${this.youtubeResults[4].url}`,
      ];

      this.initialInter.editReply({
        content: this.videoView.content[0],
        components: [this.videoView.actionRow],
        embeds: [],
      });
    }

    async createCollector() {
      const message = await this.initialInter.fetchReply();

      this.collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
      });

      this.collector.on('collect', (buttonInter) => {
        const customId = buttonInter.customId;
        const queue = this.client.queueHandler.getQueue(this.initialInter);

        if (!isNaN(customId)) {
          const video = this.youtubeResults[+customId];
          queue.add(video, this.initialInter);
        } else if (customId == 'view') {
          buttonInter.deferUpdate();
          this.viewVideos();
        } else if (buttonInter.customId == 'back') {
          this.videoView.updatePage(-1, 0, 0, buttonInter);
        } else if (buttonInter.customId == 'forward') {
          this.videoView.updatePage(1, 2, 4, buttonInter);
        } else if (buttonInter.customId == 'play') {
          const video = this.youtubeResults[this.videoView.currentPage];
          queue.add(video, this.initialInter);
        }
      });
    }
  },
};
