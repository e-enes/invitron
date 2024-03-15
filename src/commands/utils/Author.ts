import { SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Author extends Command {
  public constructor() {
    super("author");
  }

  public override initialize() {
    const { name, description } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("View bot information")
        .setNameLocalizations(name)
        .setDescriptionLocalizations(description)
        .toJSON()
    );
  }
}

export default Author;
