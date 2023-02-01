const { SlashCommandBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('play a song')
      .addStringOption((option) =>
         option.setName('input').setDescription('link or song name').setRequired(true)
      ),
   async execute(interaction) {
      const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events } = require('discord.js');
      const fs = require('fs');
      const ytdl = require('ytdl-core');
      const axios = require('axios');

      const key = process.env.YOUTUBE_KEY;

      const input = interaction.options.getString('input');
      let url;

      if (isValidUrl(input)) {
         url = input;
      } else {
         //  axios
         //     .get(
         //        `https://www.googleapis.com/youtube/v3/search?key=${key}&type=video&part=snippet&maxResults=5&q=${input}`
         //     )
         //     .then((response) => {
         //        console.log(response.data);
         //     })
         //     .catch((error) => {
         //        console.log(error);
         //     });

         let results = ['1', '2', '3', '4', '5'];
         let rows = [];

         for (let i = 0; i < results.length; i++) {
            rows.push(
               new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                     .setCustomId(i.toString())
                     .setLabel((i + 1).toString())
                     .setStyle(ButtonStyle.Primary)
               )
            );
         }

         const embed = {
            color: 0x0099ff,
            fields: [
               {
                  name: 'title',
                  value: 'author',
               },
               {
                  name: '',
                  value: '',
                  inline: false,
               },
               {
                  name: 'title',
                  value: 'author',
               },
               {
                  name: '',
                  value: '',
                  inline: false,
               },
               {
                  name: 'title',
                  value: 'author',
               },
               {
                  name: '',
                  value: '',
                  inline: false,
               },
               {
                  name: 'title',
                  value: 'author',
               },
               {
                  name: '',
                  value: '',
                  inline: false,
               },
               {
                  name: 'title',
                  value: 'author',
               },
            ],
         };

         await interaction.reply({
            ephemeral: true,
            components: [rows[0], rows[1], rows[2], rows[3], rows[4]],
            embeds: [embed],
         });

         interaction.client.on(Events.InteractionCreate, (buttonPress) => {
            if (!buttonPress.isButton()) return;
            console.log(buttonPress.customId);
         });
      }

      function isValidUrl(string) {
         let url;
         try {
            url = new URL(string);
         } catch (_) {
            return false;
         }
         return true;
      }

      //   await interaction.reply('playing ' + input);

      //   ytdl('http://www.youtube.com/watch?v=aqz-KE-bpKQ').pipe(fs.createWriteStream('video.mp4'));
   },
};
