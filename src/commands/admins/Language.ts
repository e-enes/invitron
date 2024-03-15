import { SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Language extends Command {
  public constructor() {
    super("language");
  }

  public override initialize() {
    const { name, description, options } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Set a language for the bot")
        .setNameLocalizations(name)
        .setDescriptionLocalizations(description)
        .addStringOption((option) =>
          option
            .setName("language")
            .setDescription("Language to set")
            .setNameLocalizations(options!.language.name)
            .setDescriptionLocalizations(options!.language.description)
        )
        .toJSON()
    );
  }
}

export default Language;
