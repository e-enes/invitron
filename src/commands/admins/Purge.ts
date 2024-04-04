import { EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import i18next from "i18next";

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
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("cache")
            .setDescription("Clear the cache on this server")
            .setDescriptionLocalizations(subcommands!.cache.description)
        )
        .toJSON()
    );
  }

  public override async executeChatInput(interaction: Command.ChatInput, keys: Command.Keys) {
    const member = interaction.member as GuildMember;
    const { utils, config } = this.client;

    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t("commands.insufficient_permission.title", { lng: keys.language }))
            .setDescription(i18next.t("commands.insufficient_permission.description", { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    if (!interaction.options.getSubcommand()) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t("commands.unknown_command.title", { lng: keys.language }))
            .setDescription(i18next.t("commands.unknown_command.description", { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    await utils
      .overwriteCache(interaction.guild!)
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.success.description`, { lng: keys.language }))
              .setColor(config.message.colors.default)
              .withDefaultFooter(),
          ],
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.error.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.error.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }
}

export default Purge;
