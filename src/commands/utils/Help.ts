import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import i18next from "i18next";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Help extends Command {
  public constructor() {
    super("help");
  }

  public override initialize() {
    const { description } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("View commands details")
        .setDescriptionLocalizations(description)
        .setDMPermission(false)
        .toJSON()
    );
  }

  public override async executeChatInput(interaction: Command.ChatInput, keys: Command.Keys) {
    const { config } = this.client;

    const helpEmbed = new EmbedBuilder()
      .setTitle(i18next.t(`commands.${this.name}.messages.success.title`))
      .setColor(config.message.colors.default)
      .withDefaultFooter();

    this.client.commands
      .map((command) => command.applicationCommands)
      .flat()
      .filter((command) => command.name !== "purge" && command.name !== "help")
      .forEach((command) => {
        helpEmbed.addFields({
          name: `\`${command.name}\``,
          value: i18next.t(`commands.${command.name}.data.description`, { lng: keys.language }),
          inline: true,
        });
      });

    await interaction.reply({ embeds: [helpEmbed] });
  }
}

export default Help;
