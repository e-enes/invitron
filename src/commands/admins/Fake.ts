import { SlashCommandBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Fake extends Command {
  public constructor() {
    super("fake");
  }

  public override initialize() {
    const { description } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage the fake system")
        .setDescriptionLocalizations(description)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .toJSON()
    );
  }
}

export default Fake;
