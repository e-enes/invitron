import { SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Purge extends Command {
  public constructor() {
    super("purge");
  }

  public override initialize() {
    const { name, description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Purge cached information")
        .setNameLocalizations(name)
        .setDescriptionLocalizations(description)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("cache")
            .setDescription("Clear the cache on this server")
            .setNameLocalizations(subcommands!.cache.name)
            .setDescriptionLocalizations(subcommands!.cache.description)
        )
        .toJSON()
    );
  }
}

export default Purge;
