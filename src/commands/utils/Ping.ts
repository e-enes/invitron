import { SlashCommandBuilder } from "discord.js";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Ping extends Command {
  public constructor() {
    super("ping");
  }

  public override initialize() {
    const { name, description } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("View bot latency")
        .setNameLocalizations(name)
        .setDescriptionLocalizations(description)
        .toJSON()
    );
  }
}

export default Ping;
