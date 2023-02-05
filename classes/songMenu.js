const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');

module.exports = {
   SongMenu: class {
      constructor(initialInter, youtubeResults, query) {
         this.initialInter = initialInter;
         this.client = initialInter.client;
         this.query = query;
         this.youtubeResults = youtubeResults;
         this.videoView = {};

         this.sendList();
         this.createCollector();
      }

      async sendList() {
         const embed = new EmbedBuilder()
            .setTitle(`Search this.youtubeResults for *${this.query}*`)
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
         this.videoView.actionRow = new ActionRowBuilder();

         this.videoView.actionRow.addComponents(new ButtonBuilder().setCustomId('back').setStyle(ButtonStyle.Primary).setEmoji('⏮').setDisabled());
         this.videoView.actionRow.addComponents(new ButtonBuilder().setCustomId('play').setStyle(ButtonStyle.Primary).setEmoji('▶'));
         this.videoView.actionRow.addComponents(new ButtonBuilder().setCustomId('forward').setStyle(ButtonStyle.Primary).setEmoji('⏭'));

         this.videoView.currentPage = 0;
         this.videoView.content = [
            `**1/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[0].id.videoId}`,
            `**2/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[1].id.videoId}`,
            `**3/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[2].id.videoId}`,
            `**4/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[3].id.videoId}`,
            `**5/5** \n https://www.youtube.com/watch?v=${this.youtubeResults[4].id.videoId}`,
         ];

         this.initialInter.editReply({ content: this.videoView.content[0], components: [this.videoView.actionRow], embeds: [] });
      }

      updatePage(num, i, limit, buttonInter) {
         buttonInter.deferUpdate();
         this.videoView.currentPage += num;
         if (this.videoView.currentPage == limit) {
            this.videoView.actionRow.components[i].setDisabled();
         }
         this.videoView.actionRow.components[2 - i].setDisabled(false);
         this.initialInter.editReply({ content: this.videoView.content[this.videoView.currentPage], components: [this.videoView.actionRow] });
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
               this.initialInter.editReply({
                  content: `added **${this.youtubeResults[+customId].snippet.title}** to queue`,
                  components: [],
                  embeds: [],
               });
            } else if (buttonInter.customId == 'back') {
               this.updatePage(-1, 0, 0, buttonInter);
            } else if (buttonInter.customId == 'forward') {
               this.updatePage(1, 2, 4, buttonInter);
            } else if (buttonInter.customId == 'play') {
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
