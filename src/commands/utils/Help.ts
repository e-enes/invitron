import { SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Help extends Command {
  public constructor() {
    super("help");
  }

  public override initialize() {
    const { description } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("View commands details")
        .setDescriptionLocalizations(description)
        .setDMPermission(false)
        .toJSON()
    );
  }
}

export default Help;
