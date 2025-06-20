const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');

class VideoPicker {
  constructor(interaction, query, options) {
    this.interaction = interaction;
    this.query = query;
    this.options = options;

    this.choice = new Promise((resolve) => (this.choose = resolve));

    this.sendList();
  }

  sendList() {
    const fields = this.options.map((option, index) => ({
      name: ' ',
      value: option.listItem(index + 1),
    }));

    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setTitle(`Search results for *${this.query}*`)
      .addFields(...fields);

    this.interaction.editReply({
      embeds: [embed],
    });
  }
}

module.exports = VideoPicker;
