const { SlashCommandBuilder } = require('discord.js');
const { SongMenu } = require('../classes/songMenu.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('play a song')
      .addStringOption((option) => option.setName('input').setDescription('link or song name').setRequired(true)),
   async execute(interaction) {
      const fs = require('fs');
      const ytdl = require('ytdl-core');
      const { google } = require('googleapis');
      const axios = require('axios');

      async function getYouTubeVideos() {
         const youtube = google.youtube({
            version: 'v3',
            auth: key,
         });
         const response = await youtube.search
            .list({
               part: 'snippet',
               type: 'video',
               q: input,
               maxResults: 5,
            })
            .catch(() => {
               interaction.reply({ content: 'error searching for videos', ephemeral: true });
               return null;
            });

         return response.data.items;
      }

      async function checkValidity() {
         try {
            await axios.get('https://www.youtube.com/oembed?format=json&url=' + input);
            return true;
         } catch (error) {
            return false;
         }
      }

      function getYouTubeId(url) {
         const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
         const match = url.match(regExp);

         if (match && match[2].length === 11) {
            return match[2];
         } else {
            return null;
         }
      }

      const key = process.env.YOUTUBE_KEY;
      const input = interaction.options.getString('input');
      const vc = interaction.member.voice.channel;

      if (!vc) return interaction.reply({ content: 'you must be in a vc to use this command', ephemeral: true });

      if (input.startsWith('https://')) {
         const valid = await checkValidity(input);

         if (valid) {
            const youtubeId = getYouTubeId(input);
            interaction.reply(`added **${input}** to queue`);
            interaction.client.queueHandler.getQueue(interaction).add(youtubeId);
         } else {
            return interaction.reply({ content: 'not a valid link', ephemeral: true });
         }
      } else {
         const youtubeResults = await getYouTubeVideos();
         if (!youtubeResults) return;

         interaction.songMenu = new SongMenu(interaction, youtubeResults);
      }
   },
};
