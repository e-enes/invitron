import { ActionRowBuilder, EmbedBuilder, GuildMember, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import i18next from "i18next";

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

  public override async executeChatInput(interaction: Command.ChatInput, keys: Command.Keys) {
    const { config } = this.client;

    const member = interaction.member as GuildMember;

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

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(i18next.t(`commands.${this.name}.messages.stage.title`, { lng: keys.language }))
          .setDescription(i18next.t(`commands.${this.name}.messages.stage.description`, { lng: keys.language }))
          .setColor(config.message.colors.default)
          .setThumbnail(interaction.guild!.iconURL({ forceStatic: true }) ?? this.client.user.displayAvatarURL({ forceStatic: true }))
          .withDefaultFooter(),
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`setup:default:${member.user.id}`)
            .setPlaceholder(i18next.t(`components.${this.name}.selectMenu.placeholder`, { lng: keys.language }))
            .setOptions(
              {
                label: i18next.t(`components.${this.name}.selectMenu.language.label`, { lng: keys.language }),
                description: i18next.t(`components.${this.name}.selectMenu.language.description`, { lng: keys.language }),
                value: "language",
              },
              {
                label: i18next.t(`components.${this.name}.selectMenu.channel.label`, { lng: keys.language }),
                description: i18next.t(`components.${this.name}.selectMenu.channel.description`, { lng: keys.language }),
                value: "channel",
              },
              {
                label: i18next.t(`components.${this.name}.selectMenu.role.label`, { lng: keys.language }),
                description: i18next.t(`components.${this.name}.selectMenu.role.description`, { lng: keys.language }),
                value: "role",
              },
              {
                label: i18next.t(`components.${this.name}.selectMenu.fake.label`, { lng: keys.language }),
                description: i18next.t(`components.${this.name}.selectMenu.fake.description`, { lng: keys.language }),
                value: "fake",
              },
              {
                label: i18next.t(`components.${this.name}.selectMenu.leaderboard.label`, { lng: keys.language }),
                description: i18next.t(`components.${this.name}.selectMenu.leaderboard.description`, { lng: keys.language }),
                value: "leaderboard",
              }
            )
            .setMaxValues(1)
        ),
      ],
    });
  }
}

export default Setup;
