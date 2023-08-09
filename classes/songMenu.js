const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');

module.exports = {
  SongMenu: class {
    constructor(initialInter, youtubeResults) {
      this.initialInter = initialInter;
      this.client = initialInter.client;
      this.query = initialInter.options.getString('input');
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
          value: `
            **${i + 1}.** [${result.title}](<${result.url}>) (${
            result.durationRaw || `${result.videoCount} videos`
          }) 
            *${result.channel.name}*
          `,
        });
      }

      const embed = new EmbedBuilder()
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
        content: [],

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

      for (let i = 0; i < this.resultNum; i++) {
        this.videoView.content.push(`**${i + 1}/${this.resultNum}**\n${this.youtubeResults[i].url}`);
      }

      this.initialInter.editReply({
        content: this.videoView.content[0],
        components: [this.videoView.actionRow],
        embeds: [],
      });
    }

    async createCollector() {
      const message = await this.initialInter.fetchReply();
      let played = false;

      this.collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
      });

      this.collector.on('end', () => {
        if (!played) message.delete().catch(() => {});
      });

      this.collector.on('collect', (buttonInter) => {
        const customId = buttonInter.customId;
        const queue = this.client.queueHandler.getQueue(this.initialInter);

        if (!isNaN(customId)) {
          const video = this.youtubeResults[+customId];
          queue.add(video, this.initialInter);
          played = true;
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
          played = true;
        }

        this.collector.resetTimer();
      });
    }
  },
};
