import { EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import i18next from "i18next";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Language extends Command {
  public constructor() {
    super("language");
  }

  public override initialize() {
    const { description, options } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Set a language for the bot")
        .setDescriptionLocalizations(description)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addStringOption((option) =>
          option
            .setName("language")
            .setDescription("Language to set")
            .setDescriptionLocalizations(options!.language.description)
            .setChoices(
              {
                name: "English",
                value: "en",
              },
              {
                name: "Français",
                value: "fr",
              },
              {
                name: "Nederlands",
                value: "nl",
              },
              {
                name: "Русский",
                value: "ru",
              },
              {
                name: "Tiếng Việt",
                value: "vi",
              }
            )
            .setRequired(false)
        )
        .toJSON()
    );
  }

  public override async executeChatInput(interaction: Command.ChatInput, keys: Command.Keys) {
    const member = interaction.member as GuildMember;
    const { database, config } = this.client;

    const language = interaction.options.getString("language");

    if (!language) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${i18next.t(`commands.${this.name}.messages.current_language.title`, { lng: keys.language })}`)
            .setDescription(
              i18next.t(`commands.${this.name}.messages.current_language.description`, {
                lng: keys.language,
              })
            )
            .setColor(config.message.colors.success)
            .withDefaultFooter(),
        ],
      });

      return;
    }

    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${i18next.t("commands.insufficient_permission.title", { lng: keys.language })}`)
            .setDescription(
              i18next.t("commands.insufficient_permission.description", {
                lng: keys.language,
              })
            )
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    await database
      .query("UPDATE guilds SET language = ? WHERE guild_id = ?", [language, interaction.guild!.id])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`commands.${this.name}.messages.success.title`, { lng: language })}`)
              .setDescription(
                i18next.t(`commands.${this.name}.messages.success.description`, {
                  lng: language,
                })
              )
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${i18next.t(`commands.${this.name}.messages.error.title`, { lng: keys.language })}`)
              .setDescription(
                i18next.t(`commands.${this.name}.messages.error.description`, {
                  lng: keys.language,
                })
              )
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }
}

export default Language;
