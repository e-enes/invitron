import { SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Invites extends Command {
  public constructor() {
    super("invites");
  }

  public override initialize() {
    const { name, description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage invitations")
        .setNameLocalizations(name)
        .setDescriptionLocalizations(description)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("view")
            .setDescription("View invitation")
            .setNameLocalizations(subcommands!.view.name)
            .setDescriptionLocalizations(subcommands!.view.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setNameLocalizations(subcommands!.view.options!.member.name)
                .setDescriptionLocalizations(subcommands!.view.options!.member.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add invitation to a member")
            .setNameLocalizations(subcommands!.add.name)
            .setDescriptionLocalizations(subcommands!.add.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setNameLocalizations(subcommands!.add.options!.member.name)
                .setDescriptionLocalizations(subcommands!.add.options!.member.description)
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of invitations to add")
                .setNameLocalizations(subcommands!.add.options!.number.name)
                .setDescriptionLocalizations(subcommands!.add.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove invitation to a member")
            .setNameLocalizations(subcommands!.remove.name)
            .setDescriptionLocalizations(subcommands!.remove.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setNameLocalizations(subcommands!.remove.options!.member.name)
                .setDescriptionLocalizations(subcommands!.remove.options!.member.description)
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of invitations to remove")
                .setNameLocalizations(subcommands!.remove.options!.number.name)
                .setDescriptionLocalizations(subcommands!.remove.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("reset")
            .setDescription("Reset a member's invitations")
            .setNameLocalizations(subcommands!.reset.name)
            .setDescriptionLocalizations(subcommands!.reset.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setNameLocalizations(subcommands!.reset.options!.member.name)
                .setDescriptionLocalizations(subcommands!.reset.options!.member.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("create")
            .setDescription("Create an invitation link that never expires")
            .setNameLocalizations(subcommands!.create.name)
            .setDescriptionLocalizations(subcommands!.create.description)
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("check")
            .setDescription("Discover which members hava utilized this code or identify the member associated with it")
            .setNameLocalizations(subcommands!.check.name)
            .setDescriptionLocalizations(subcommands!.check.description)
            .addStringOption((option) =>
              option
                .setName("code")
                .setDescription("Code (without discord.gg/)")
                .setNameLocalizations(subcommands!.check.options!.code.name)
                .setDescriptionLocalizations(subcommands!.check.options!.code.description)
                .setRequired(false)
            )
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setNameLocalizations(subcommands!.check.options!.member.name)
                .setDescriptionLocalizations(subcommands!.check.options!.member.description)
                .setRequired(false)
            )
        )
        .toJSON()
    );
  }
}

export default Invites;
