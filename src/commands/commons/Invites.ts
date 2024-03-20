import { SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Invites extends Command {
  public constructor() {
    super("invites");
  }

  public override initialize() {
    const { description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage invitations")
        .setDescriptionLocalizations(description)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("view")
            .setDescription("View invitation")
            .setDescriptionLocalizations(subcommands!.view.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.view.options!.member.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add invitation to a member")
            .setDescriptionLocalizations(subcommands!.add.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.add.options!.member.description)
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of invitations to add")
                .setDescriptionLocalizations(subcommands!.add.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove invitation to a member")
            .setDescriptionLocalizations(subcommands!.remove.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.remove.options!.member.description)
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of invitations to remove")
                .setDescriptionLocalizations(subcommands!.remove.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("reset")
            .setDescription("Reset a member's invitations")
            .setDescriptionLocalizations(subcommands!.reset.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.reset.options!.member.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("create")
            .setDescription("Create an invitation link that never expires")
            .setDescriptionLocalizations(subcommands!.create.description)
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("check")
            .setDescription("Discover which members hava utilized this code or identify the member associated with it")
            .setDescriptionLocalizations(subcommands!.check.description)
            .addStringOption((option) =>
              option
                .setName("code")
                .setDescription("Code (without discord.gg/)")
                .setDescriptionLocalizations(subcommands!.check.options!.code.description)
                .setRequired(false)
            )
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.check.options!.member.description)
                .setRequired(false)
            )
        )
        .toJSON()
    );
  }
}

export default Invites;
