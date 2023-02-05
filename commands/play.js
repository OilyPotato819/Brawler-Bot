const { SlashCommandBuilder } = require('discord.js');
const { SongMenu } = require('../classes/songMenu.js');
const { Queue } = require('../classes/queue.js');

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
         const response = await youtube.search.list({
            part: 'snippet',
            type: 'video',
            q: input,
            maxResults: 5,
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

      function addToQueue(youtubeId, interaction) {
         const guildId = interaction.guildId;
         const vc = interaction.member.voice.channel;
         const client = interaction.client;

         if (!vc) {
            interaction.editReply({
               content: `you must be in a vc to add to queue`,
               components: [],
               embeds: [],
            });
         }

         if (!client.queues) {
            client.queues = new Map();
         }
         if (!client.queues.get(guildId)) {
            client.queues.set(guildId, new Queue(vc, client));
         }

         client.queues.get(guildId).add(youtubeId);
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
            addToQueue(youtubeId, interaction);
         } else {
            return interaction.reply({ content: 'not a valid link', ephemeral: true });
         }
      } else {
         const youtubeResults = await getYouTubeVideos();

         interaction.songMenu = new SongMenu(interaction, youtubeResults, addToQueue);
      }
   },
};
