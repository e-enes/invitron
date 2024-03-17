import { SlashCommandBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Roles extends Command {
  public constructor() {
    super("roles");
  }

  public override initialize() {
    const { description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage invitation roles")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDescriptionLocalizations(description)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add invitation role")
            .setDescriptionLocalizations(subcommands!.add.description)
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("Mention a server role")
                .setDescriptionLocalizations(subcommands!.add.options!.role.description)
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of invitations to have the role")
                .setDescriptionLocalizations(subcommands!.add.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove invitation role")
            .setDescriptionLocalizations(subcommands!.remove.description)
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("Mention a server role")
                .setDescriptionLocalizations(subcommands!.remove.options!.role.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("list")
            .setDescription("View invitation roles list")
            .setDescriptionLocalizations(subcommands!.list.description)
        )
        .toJSON()
    );
  }
}

export default Roles;
