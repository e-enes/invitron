import { SlashCommandBuilder } from "discord.js";

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
        .addSubcommand((subcommand) =>
          subcommand
            .setName("basic")
            .setDescription("View basic leaderboard")
            .setDescriptionLocalizations(subcommands!.basic.description)
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("smart")
            .setDescription("View smart leaderboard")
            .setDescriptionLocalizations(subcommands!.smart.description)
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("exclude")
            .setDescription("Exclude a member or role from the leaderboard view")
            .setDescriptionLocalizations(subcommands!.exclude.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.exclude.options!.member.description)
                .setRequired(false)
            )
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("Mention a server role")
                .setDescriptionLocalizations(subcommands!.exclude.options!.role.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("include")
            .setDescription("Include a member or role from the leaderboard view")
            .setDescriptionLocalizations(subcommands!.include.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.include.options!.member.description)
                .setRequired(false)
            )
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("Mention a server role")
                .setDescriptionLocalizations(subcommands!.include.options!.role.description)
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
}

export default Leaderboard;
