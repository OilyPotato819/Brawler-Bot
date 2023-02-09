module.exports = {
   data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('play a song')
      .addStringOption((option) => option.setName('input').setDescription('link or song name').setRequired(true)),
   async execute(interaction) {
      const input = interaction.options.getString('input');
      const queue = interaction.client.queueHandler.getQueue(interaction);

      if (!interaction.member.voice.channel) return interaction.reply({ content: 'you must be in a vc to use this command', ephemeral: true });

      if (input.startsWith('https://')) {
         await axios.get('https://www.youtube.com/oembed?format=json&url=' + input).catch(() => {
            return interaction.reply({ content: 'not a valid link', ephemeral: true });
         });
         queue.add(input);
         interaction.reply(`added ${input} to queue`);
      } else {
         const youtubeResults = await queue.search(input);
         interaction.songMenu = new SongMenu(interaction, youtubeResults);
      }
   },
};
