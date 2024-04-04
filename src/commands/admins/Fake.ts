import { ActionRowBuilder, EmbedBuilder, GuildMember, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";
import i18next from "i18next";

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

  public override async executeChatInput(interaction: Command.ChatInput, keys: Command.Keys) {
    const { database, config } = this.client;

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

    const data = await database.query(
      "SELECT role_id AS role, custom_profile_pic AS avatar, older, own_invite AS own, first_join AS firstJoin, back_original_inviter AS back FROM fakes WHERE guild_id = ?",
      [interaction.guild!.id]
    );

    const [row] = data;
    const configuration = `Specific Role: ${row?.role ? `✅ (<@&${row.role}>)` : "❌"}\nCustom Avatar: ${row?.avatar ? "✅" : "❌"}\nAged Account: ${row?.older ? `✅ (\`${row.older}\`d)` : "❌"}\nNo Self-Invite: ${row?.own ? "✅" : "❌"}\nSingle Count: ${row?.firstJoin ? "✅" : "❌"}\nReturn Invite: ${row?.back ? "✅" : "❌"}`;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(i18next.t(`commands.${this.name}.messages.dropdown.title`, { lng: keys.language }))
          .setDescription(i18next.t(`commands.${this.name}.messages.dropdown.description`, { lng: keys.language, configuration }))
          .setColor(config.message.colors.success)
          .withDefaultFooter(),
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`fake:${member.user.id}`)
            .setPlaceholder(i18next.t(`components.${this.name}.selectMenu.placeholder`, { lng: keys.language }))
            .setOptions(
              {
                label: i18next.t(`components.${this.name}.selectMenu.role.label`, { lng: keys.language }),
                description: i18next.t(`components.${this.name}.selectMenu.role.description`, { lng: keys.language }),
                value: "role_id",
              },
              {
                label: i18next.t(`components.${this.name}.selectMenu.profile_pic.label`, { lng: keys.language }),
                description: i18next.t(`components.${this.name}.selectMenu.profile_pic.description`, { lng: keys.language }),
                value: "custom_profile_pic",
              },
              {
                label: i18next.t(`components.${this.name}.selectMenu.older.label`, { lng: keys.language }),
                description: i18next.t(`components.${this.name}.selectMenu.older.description`, { lng: keys.language }),
                value: "older",
              },
              {
                label: i18next.t(`components.${this.name}.selectMenu.own_invite.label`, { lng: keys.language }),
                description: i18next.t(`components.${this.name}.selectMenu.own_invite.description`, { lng: keys.language }),
                value: "own_invite",
              },
              {
                label: i18next.t(`components.${this.name}.selectMenu.first_join.label`, { lng: keys.language }),
                description: i18next.t(`components.${this.name}.selectMenu.first_join.description`, { lng: keys.language }),
                value: "first_join",
              },
              {
                label: i18next.t(`components.${this.name}.selectMenu.back_inviter.label`, { lng: keys.language }),
                description: i18next.t(`components.${this.name}.selectMenu.back_inviter.description`, { lng: keys.language }),
                value: "back_original_inviter",
              }
            )
            .setMaxValues(1)
        ),
      ],
    });
  }
}

export default Fake;
