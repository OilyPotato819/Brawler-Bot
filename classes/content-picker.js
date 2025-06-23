const { messageFactory, ErrorMessage } = require('../messages.js');
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');

class ContentPicker {
  constructor(query, options) {
    this.query = query;
    this.options = options;
  }

  async getChoice(interaction) {
    const fields = this.options.map((option, i) => ({
      name: ' ',
      value: option.listItem(i + 1),
    }));

    const embed = new EmbedBuilder()
      .setColor(0xbfda34)
      .setTitle(`Search results for *${this.query}*`)
      .addFields(fields);

    const selectOptions = Array.from({ length: this.options.length }, (_, i) =>
      new StringSelectMenuOptionBuilder().setLabel(`${i + 1}`).setValue(`${i}`)
    );
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('choice')
      .setPlaceholder('you must choose')
      .addOptions(selectOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const message = await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

    const selectInteraction = await message.awaitMessageComponent({ time: 60_000 }).catch(() => {
      throw new ErrorMessage(messageFactory.tooLong());
    });

    selectInteraction.deferUpdate();

    const choiceIndex = +selectInteraction.values[0];
    return this.options[choiceIndex];
  }
}

module.exports = ContentPicker;
