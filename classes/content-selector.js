const { ContainerBuilder, ButtonStyle, MessageFlags } = require('discord.js');

class ContentSelector {
  constructor(query, options) {
    this.query = query;
    this.options = options;
  }

  async getChoice(interaction) {
    const container = new ContainerBuilder()
      .setAccentColor(0xbfda34)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(`## Search results for *${this.query}*`)
      );

    this.options.forEach((option, index) => {
      container
        .addSeparatorComponents((builder) => builder)
        .addSectionComponents((builder) =>
          builder
            .addTextDisplayComponents((textDisplay) =>
              textDisplay.setContent(option.toSelectEntry())
            )
            .setButtonAccessory((button) =>
              button
                .setCustomId(`${index}`)
                .setLabel('Select')
                .setStyle(ButtonStyle.Primary)
            )
        );
    });

    const message = await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
    interaction.isComponentsV2 = true;

    const buttonInteraction = await message
      .awaitMessageComponent({ time: 60_000 })
      .catch(() => null);

    if (!buttonInteraction) return null;
    buttonInteraction.deferUpdate();
    const choiceIndex = +buttonInteraction.customId;

    return this.options[choiceIndex];
  }
}

module.exports = ContentSelector;
