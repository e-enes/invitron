import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, GuildMember, Role, SlashCommandBuilder } from "discord.js";
import { ButtonStyle, PermissionFlagsBits } from "discord-api-types/v10";
import i18next from "i18next";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Roles extends Command {
  public constructor() {
    super("roles");
  }

  public override initialize() {
    const { description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage invitation roles")
        .setDescriptionLocalizations(description)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add invitation role")
            .setDescriptionLocalizations(subcommands!.add.description)
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("Mention a server role")
                .setDescriptionLocalizations(subcommands!.add.options!.role.description)
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of invitations to have the role")
                .setDescriptionLocalizations(subcommands!.add.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove invitation role")
            .setDescriptionLocalizations(subcommands!.remove.description)
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("Mention a server role")
                .setDescriptionLocalizations(subcommands!.remove.options!.role.description)
                .setRequired(true)
            )
            .addBooleanOption((option) =>
              option
                .setName("delete")
                .setDescription("Remove this role from members who have it")
                .setDescriptionLocalizations(subcommands!.remove.options!.delete.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("list").setDescription("View invitation roles list").setDescriptionLocalizations(subcommands!.list.description)
        )
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

    await this[interaction.options.getSubcommand()](interaction, keys);
  }

  private async add(interaction: Command.ChatInput, keys: Command.Keys) {
    const { database, config } = this.client;

    const role = interaction.options.getRole("role", true) as Role;
    const number = interaction.options.get("number", true).value as number;

    if (!role || !number) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.invalid_options.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.invalid_options.description`, { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    if (!role.editable) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.not_editable_role.title`, { lng: keys.language }))
            .setDescription(
              i18next.t(`commands.${this.name}.messages.not_editable_role.description`, { lng: keys.language, role: role.id })
            )
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    const data = await database.query("SELECT number_invitations AS requiredInvitations FROM roles WHERE role_id = ?", [role.id]);

    if (data.length !== 0) {
      if (data[0].requiredInvitations !== number) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.existed_role_update.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.existed_role_update.description`, { lng: keys.language, role: role.id, number })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId(`roles:${role.id}:${number}:${interaction.member!.user.id}`)
                .setLabel(i18next.t(`components.${this.name}.button.update.label`, { lng: keys.language }))
                .setStyle(ButtonStyle.Danger)
            ),
          ],
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.existed_role.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.existed_role.description`, { lng: keys.language, role: role.id, number })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
        });
      }

      return;
    }

    await database
      .query("INSERT INTO roles (guild_id, role_id, number_invitations) VALUES (?, ?, ?)", [interaction.guild!.id, role.id, number])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success_add.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.success_add.description`, { lng: keys.language, role: role.id }))
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.error_add.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.error_add.description`, { lng: keys.language, role: role.id, number })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }

  private async remove(interaction: Command.ChatInput, keys: Command.Keys) {
    const { database, config } = this.client;

    const role = interaction.options.getRole("role", true) as Role;
    const del = interaction.options.getBoolean("delete");

    if (!role) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.invalid_options.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.invalid_options.description`, { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    const data = await database.query("SELECT 1 FROM roles WHERE role_id = ?", [role.id]);

    if (data.length === 0) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.not_existed_role.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.not_existed_role.description`, { lng: keys.language, role: role.id }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    await database
      .query("DELETE FROM roles WHERE role_id = ?", [role.id])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success_remove.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.success_remove.description`, { lng: keys.language, role: role.id }))
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
        });

        if (del) {
          interaction.guild!.roles.delete(role).catch(() => void 0);
        }
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.error_remove.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.error_remove.description`, { lng: keys.language, role: role.id }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }

  private async list(interaction: Command.ChatInput, keys: Command.Keys) {
    await interaction.deferReply();

    const { database, config } = this.client;

    const data = await database.query(
      "SELECT role_id AS role, number_invitations AS number, active FROM roles WHERE guild_id = ? ORDER BY role",
      [interaction.guild!.id]
    );

    if (data.length === 0) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.empty_list.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.empty_list.description`, { lng: keys.language }))
            .setColor(config.message.colors.warn)
            .withDefaultFooter(),
        ],
      });

      return;
    }

    let number = 0;
    const rolesPromises: Promise<string | undefined>[] = [];

    data.forEach((row: { role: string; number: number; active: boolean }, index: number) => {
      rolesPromises.push(
        (async () => {
          const role = await interaction.guild!.roles.fetch(row.role, { cache: true }).catch(() => null);

          if (!role) {
            await database.query("DELETE FROM roles WHERE role_id = ?", [row.role]);
            return;
          }

          if (row.active) {
            number++;
            return i18next.t(`commands.${this.name}.messages.role_list.pre_valid_description`, {
              lng: keys.language,
              index: index + 1,
              role: role.id,
              number: row.number,
            });
          } else {
            return i18next.t(`commands.${this.name}.messages.role_list.pre_invalid_description`, {
              lng: keys.language,
              index: index + 1,
              role: role.id,
            });
          }
        })()
      );
    });

    const roles = await Promise.all(rolesPromises);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(i18next.t(`commands.${this.name}.messages.role_list.title`, { lng: keys.language }))
          .setDescription(
            i18next.t(`commands.${this.name}.messages.role_list.description`, {
              lng: keys.language,
              roles: roles.filter(Boolean).join("\n"),
              number,
            })
          )
          .setColor(config.message.colors.success)
          .withDefaultFooter(),
      ],
    });
  }
}

export default Roles;
