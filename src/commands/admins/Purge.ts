import { SlashCommandBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Purge extends Command {
  public constructor() {
    super("purge");
  }

  public override initialize() {
    const { description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Purge cached information")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDescriptionLocalizations(description)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("cache")
            .setDescription("Clear the cache on this server")
            .setDescriptionLocalizations(subcommands!.cache.description)
        )
        .toJSON()
    );
  }
}

export default Purge;
