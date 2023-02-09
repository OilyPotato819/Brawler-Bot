const { SlashCommandBuilder } = require("discord.js");
const { SongMenu } = require("../classes/songMenu.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("play a song")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("link or song name")
        .setRequired(true)
    ),
  async execute(interaction) {
    const input = interaction.options.getString("input");
    const queue = interaction.client.queueHandler.getQueue(interaction);

    if (!queue) return;

    if (input.startsWith("https://")) {
      await axios
        .get("https://www.youtube.com/oembed?format=json&url=" + input)
        .catch(() => {
          return interaction.reply({
            content: "not a valid link",
            ephemeral: true,
          });
        });
      queue.add(input);
      interaction.reply(`added ${input} to queue`);
    } else {
      const youtubeResults = await queue.search(input);
      interaction.songMenu = new SongMenu(interaction, youtubeResults);
    }
  },
};
