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
         function formatTitle(string) {
            let title;
            title = string.replaceAll('&quot;', '"');
            title = title.replaceAll('&amp;', '&');

            return title;
         }

         const title1 = formatTitle(this.youtubeResults[0].snippet.title);
         const title2 = formatTitle(this.youtubeResults[1].snippet.title);
         const title3 = formatTitle(this.youtubeResults[2].snippet.title);
         const title4 = formatTitle(this.youtubeResults[3].snippet.title);
         const title5 = formatTitle(this.youtubeResults[4].snippet.title);

         const embed = new EmbedBuilder()
            .setTitle(`Search results for *${this.query}*`)
            .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            .setAuthor({ name: this.client.user.username, iconURL: this.client.user.avatarURL() })
            .addFields(
               { name: ' ', value: `**1.** ${title1} \n *${this.youtubeResults[0].snippet.channelTitle}*` },
               { name: ' ', value: `**2.** ${title2} \n *${this.youtubeResults[1].snippet.channelTitle}*` },
               { name: ' ', value: `**3.** ${title3} \n *${this.youtubeResults[2].snippet.channelTitle}*` },
               { name: ' ', value: `**4.** ${title4} \n *${this.youtubeResults[3].snippet.channelTitle}*` },
               { name: ' ', value: `**5.** ${title5} \n *${this.youtubeResults[4].snippet.channelTitle}*` }
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

         await this.initialInter.reply({ components: [row1, row2], embeds: [embed], ephemeral: true });
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
               songMenu.initialInter.editReply({ content: this.content[this.currentPage], components: [this.actionRow] });
            },
         };

         this.videoView.actionRow.addComponents(new ButtonBuilder().setCustomId('back').setStyle(ButtonStyle.Primary).setEmoji('⏮').setDisabled());
         this.videoView.actionRow.addComponents(new ButtonBuilder().setCustomId('play').setStyle(ButtonStyle.Primary).setEmoji('▶'));
         this.videoView.actionRow.addComponents(new ButtonBuilder().setCustomId('forward').setStyle(ButtonStyle.Primary).setEmoji('⏭'));

         this.videoView.content = [
            `**1/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[0].id.videoId}`,
            `**2/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[1].id.videoId}`,
            `**3/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[2].id.videoId}`,
            `**4/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[3].id.videoId}`,
            `**5/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[4].id.videoId}`,
         ];

         this.initialInter.editReply({ content: this.videoView.content[0], components: [this.videoView.actionRow], embeds: [] });
      }

      async createCollector() {
         const message = await this.initialInter.fetchReply();

         this.collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

         this.collector.on('collect', (buttonInter) => {
            const customId = buttonInter.customId;

            if (!isNaN(customId)) {
               const youtubeId = this.youtubeResults[+customId].id.videoId;
               this.client.queueHandler.getQueue(this.initialInter).add(youtubeId);
               this.initialInter.editReply({
                  content: `added **${this.youtubeResults[+customId].snippet.title}** to queue`,
                  components: [],
                  embeds: [],
               });
            } else if (customId == 'view') {
               buttonInter.deferUpdate();
               this.viewVideos();
            } else if (buttonInter.customId == 'back') {
               this.videoView.updatePage(-1, 0, 0, buttonInter);
            } else if (buttonInter.customId == 'forward') {
               this.videoView.updatePage(1, 2, 4, buttonInter);
            } else if (buttonInter.customId == 'play') {
               const youtubeId = this.youtubeResults[this.videoView.currentPage].id.videoId;
               this.client.queueHandler.getQueue(this.initialInter).add(youtubeId);
               this.initialInter.editReply({
                  content: `added **${this.youtubeResults[this.videoView.currentPage].snippet.title}** to queue`,
                  components: [],
                  embeds: [],
               });
            }
         });
      }
   },
};
