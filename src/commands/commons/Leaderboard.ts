import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import i18next from "i18next";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Leaderboard extends Command {
  public constructor() {
    super("leaderboard");
  }

  public override initialize() {
    const { description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage leaderboard")
        .setDescriptionLocalizations(description)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
          subcommand.setName("basic").setDescription("View basic leaderboard").setDescriptionLocalizations(subcommands!.basic.description)
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("smart").setDescription("View smart leaderboard").setDescriptionLocalizations(subcommands!.smart.description)
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("exclude")
            .setDescription("Exclude a member or role from the leaderboard view")
            .setDescriptionLocalizations(subcommands!.exclude.description)
            .addMentionableOption((option) =>
              option
                .setName("mentionable")
                .setDescription("Mention a server member/role")
                .setDescriptionLocalizations(subcommands!.exclude.options!.mentionable.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("include")
            .setDescription("Include a member or role from the leaderboard view")
            .setDescriptionLocalizations(subcommands!.include.description)
            .addMentionableOption((option) =>
              option
                .setName("mentionable")
                .setDescription("Mention a server member/role")
                .setDescriptionLocalizations(subcommands!.include.options!.mentionable.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("top")
            .setDescription("Define how many members the leaderboard should display")
            .setDescriptionLocalizations(subcommands!.top.description)
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of members")
                .setDescriptionLocalizations(subcommands!.top.options!.number.description)
                .setRequired(true)
            )
        )
        .toJSON()
    );
  }

  public override async executeChatInput(interaction: Command.ChatInput, keys: Command.Keys) {
    const { config } = this.client;

    if (!interaction.options.getSubcommand()) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t("commands.unknown_command.title", { lng: keys.language }))
            .setDescription(i18next.t("commands.unknown_command.description", { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    await this[interaction.options.getSubcommand()](interaction, keys);
  }
}

export default Leaderboard;
