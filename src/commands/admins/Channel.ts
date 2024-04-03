import { SlashCommandBuilder } from "discord.js";
import { ChannelType, PermissionFlagsBits } from "discord-api-types/v10";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Channel extends Command {
  public constructor() {
    super("channel");
  }

  public override initialize() {
    const { description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage join/leave channel")
        .setDescriptionLocalizations(description)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("set")
            .setDescription("Set join/leave channel")
            .setDescriptionLocalizations(subcommands!.set.description)
            .addStringOption((option) =>
              option
                .setName("type")
                .setDescription("Choose the type of channel")
                .setDescriptionLocalizations(subcommands!.set.options!.type.description)
                .setChoices({ name: "Join", value: "join" }, { name: "Leave", value: "leave" })
                .setRequired(true)
            )
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("Choose the channel")
                .setDescriptionLocalizations(subcommands!.set.options!.channel.description)
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .toJSON()
    );
  }
}

export default Channel;
