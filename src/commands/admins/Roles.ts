import { SlashCommandBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Roles extends Command {
  public constructor() {
    super("roles");
  }

  public override initialize() {
    const { name, description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage invitation roles")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setNameLocalizations(name)
        .setDescriptionLocalizations(description)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add invitation role")
            .setNameLocalizations(subcommands!.add.name)
            .setDescriptionLocalizations(subcommands!.add.description)
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("Mention a server role")
                .setNameLocalizations(subcommands!.add.options!.role.name)
                .setDescriptionLocalizations(subcommands!.add.options!.role.description)
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of invitations to have the role")
                .setNameLocalizations(subcommands!.add.options!.number.name)
                .setDescriptionLocalizations(subcommands!.add.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove invitation role")
            .setNameLocalizations(subcommands!.remove.name)
            .setDescriptionLocalizations(subcommands!.remove.description)
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("Mention a server role")
                .setNameLocalizations(subcommands!.remove.options!.role.name)
                .setDescriptionLocalizations(subcommands!.remove.options!.role.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("list")
            .setDescription("View invitation roles list")
            .setNameLocalizations(subcommands!.list.name)
            .setDescriptionLocalizations(subcommands!.list.description)
        )
        .toJSON()
    );
  }
}

export default Roles;
