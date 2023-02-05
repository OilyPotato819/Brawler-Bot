const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');

module.exports = {
   SongMenu: class {
      constructor(initialInter, youtubeResults, addToQueue) {
         this.initialInter = initialInter;
         this.client = initialInter.client;
         this.query = initialInter.options.getString('input');
         this.youtubeResults = youtubeResults;
         this.videoView = {};
         this.addToQueue = addToQueue;

         this.sendList();
         this.createCollector();
      }

      async sendList() {
         const embed = new EmbedBuilder()
            .setTitle(`Search results for *${this.query}*`)
            .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            .setAuthor({ name: this.client.user.username, iconURL: this.client.user.avatarURL() })
            .addFields(
               { name: ' ', value: `**1.** ${this.youtubeResults[0].snippet.title} \n *${this.youtubeResults[0].snippet.channelTitle}*` },
               { name: ' ', value: `**2.** ${this.youtubeResults[1].snippet.title} \n *${this.youtubeResults[1].snippet.channelTitle}*` },
               { name: ' ', value: `**3.** ${this.youtubeResults[2].snippet.title} \n *${this.youtubeResults[2].snippet.channelTitle}*` },
               { name: ' ', value: `**4.** ${this.youtubeResults[3].snippet.title} \n *${this.youtubeResults[3].snippet.channelTitle}*` },
               { name: ' ', value: `**5.** ${this.youtubeResults[4].snippet.title} \n *${this.youtubeResults[4].snippet.channelTitle}*` }
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
         const videoView = this.videoView;

         videoView.updatePage = function (num, i, limit, buttonInter) {
            buttonInter.deferUpdate();
            videoView.currentPage += num;
            if (videoView.currentPage == limit) {
               videoView.actionRow.components[i].setDisabled();
            }
            videoView.actionRow.components[2 - i].setDisabled(false);
            this.initialInter.editReply({ content: videoView.content[videoView.currentPage], components: [videoView.actionRow] });
         };

         videoView.actionRow = new ActionRowBuilder();

         videoView.actionRow.addComponents(new ButtonBuilder().setCustomId('back').setStyle(ButtonStyle.Primary).setEmoji('⏮').setDisabled());
         videoView.actionRow.addComponents(new ButtonBuilder().setCustomId('play').setStyle(ButtonStyle.Primary).setEmoji('▶'));
         videoView.actionRow.addComponents(new ButtonBuilder().setCustomId('forward').setStyle(ButtonStyle.Primary).setEmoji('⏭'));

         videoView.currentPage = 0;
         videoView.content = [
            `**1/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[0].id.videoId}`,
            `**2/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[1].id.videoId}`,
            `**3/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[2].id.videoId}`,
            `**4/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[3].id.videoId}`,
            `**5/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[4].id.videoId}`,
         ];

         this.initialInter.editReply({ content: videoView.content[0], components: [videoView.actionRow], embeds: [] });
      }

      async createCollector() {
         const message = await this.initialInter.fetchReply();

         this.collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

         this.collector.on('collect', (buttonInter) => {
            const customId = buttonInter.customId;

            if (customId == 'view') {
               buttonInter.deferUpdate();
               this.viewVideos();
            } else if (!isNaN(customId)) {
               const youtubeId = this.youtubeResults[+customId].id.videoId;
               this.addToQueue(youtubeId, this.initialInter);
               this.initialInter.editReply({
                  content: `added **${this.youtubeResults[+customId].snippet.title}** to queue`,
                  components: [],
                  embeds: [],
               });
            } else if (buttonInter.customId == 'back') {
               this.videoView.updatePage(-1, 0, 0, buttonInter);
            } else if (buttonInter.customId == 'forward') {
               this.videoView.updatePage(1, 2, 4, buttonInter);
            } else if (buttonInter.customId == 'play') {
               const youtubeId = this.youtubeResults[this.videoView.currentPage].id.videoId;
               this.addToQueue(youtubeId, this.initialInter);
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
