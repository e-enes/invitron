import { SlashCommandBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Setup extends Command {
  public constructor() {
    super("setup");
  }

  public override initialize() {
    const { description } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Setup the bot with advanced guidance")
        .setDescriptionLocalizations(description)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .toJSON()
    );
  }
}

export default Setup;
