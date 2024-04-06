import { EmbedBuilder, GuildMember, Role, SlashCommandBuilder } from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";
import i18next from "i18next";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";
import { LeaderboardObject } from "../../types/index.js";

class Leaderboard extends Command {
  public constructor() {
    super("leaderboard");
  }

  public override initialize() {
    const { description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage leaderboard")
        .setDescriptionLocalizations(description)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
          subcommand.setName("display").setDescription("Display leaderboard").setDescriptionLocalizations(subcommands!.display.description)
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("exclude")
            .setDescription("Exclude a member or role from the leaderboard display")
            .setDescriptionLocalizations(subcommands!.exclude.description)
            .addMentionableOption((option) =>
              option
                .setName("mentionable")
                .setDescription("Mention a server member/role")
                .setDescriptionLocalizations(subcommands!.exclude.options!.mentionable.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("include")
            .setDescription("Include a member or role from the leaderboard display")
            .setDescriptionLocalizations(subcommands!.include.description)
            .addMentionableOption((option) =>
              option
                .setName("mentionable")
                .setDescription("Mention a server member/role")
                .setDescriptionLocalizations(subcommands!.include.options!.mentionable.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("top")
            .setDescription("Define how many members the leaderboard should display")
            .setDescriptionLocalizations(subcommands!.top.description)
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of members")
                .setDescriptionLocalizations(subcommands!.top.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("left")
            .setDescription("Define whether members who have left the server should be displayed")
            .setDescriptionLocalizations(subcommands!.left.description)
            .addBooleanOption((option) =>
              option
                .setName("show")
                .setDescription("Show left members")
                .setDescriptionLocalizations(subcommands!.left.options!.show.description)
                .setRequired(true)
            )
        )
        .toJSON()
    );
  }

  public override async executeChatInput(interaction: Command.ChatInput, keys: Command.Keys) {
    const { config } = this.client;

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

  private async display(interaction: Command.ChatInput, keys: Command.Keys) {
    const { database, config } = this.client;

    const data1 = await database.query(
      "SELECT I.inviter_id AS inviter, COALESCE(SUM(CASE WHEN I.inactive = 0 AND I.fake = 0 THEN 1 ELSE 0 END), 0) AS valid, COUNT(I.inviter_id) AS total, COALESCE(SUM(CASE WHEN I.inactive = 1 THEN 1 ELSE 0 END), 0) AS invalid, COALESCE(SUM(CASE WHEN I.fake = 1 THEN 1 ELSE 0 END), 0) AS fake, (SELECT COALESCE(SUM(B.bonus), 0) FROM bonus B WHERE B.guild_id = I.guild_id AND B.inviter_id = I.inviter_id) AS bonus FROM invites I WHERE I.guild_id = ? AND I.inviter_id IS NOT NULL GROUP BY I.inviter_id",
      [interaction.guild!.id]
    );
    const data2 = await database.query(
      "SELECT B.inviter_id AS inviter, COALESCE(SUM(B.bonus), 0) AS bonus FROM bonus B WHERE B.guild_id = ? GROUP BY B.inviter_id",
      [interaction.guild!.id]
    );

    const data = [...data1];

    data2.forEach((row: { inviter: string; bonus: number }) => {
      const invite = data.find((inv) => inv.inviter === row.inviter);
      if (invite) {
        invite.bonus += row.bonus;
        invite.valid += row.bonus;
      } else {
        data.push({
          inviter: row.inviter,
          valid: row.bonus,
          total: 0,
          invalid: 0,
          fake: 0,
          bonus: row.bonus,
        });
      }
    });

    if (data.length === 0) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.no_inviter.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.no_inviter.description`, { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    const leaderboardConfig = await database.query(
      "SELECT display_top AS top, display_left_inviter AS 'left' FROM leaderboards WHERE guild_id = ?",
      [interaction.guild!.id]
    );

    const excludedEntries = await database.query(
      "SELECT excluded_type AS excludedType, excluded_id AS excludedId FROM leaderboards_exclude WHERE guild_id = ?",
      [interaction.guild!.id]
    );

    const excludedMembers = excludedEntries
      .filter((entry: { excludedType: string }) => entry.excludedType === "member")
      .map((entry: { excludedId: string }) => entry.excludedId);
    const excludedRoles = excludedEntries
      .filter((entry: { excludedType: string }) => entry.excludedType === "role")
      .map((entry: { excludedId: string }) => entry.excludedId);

    const top = leaderboardConfig?.[0]?.top || 15;
    const count = data.length > top ? data.length - top : 0;

    const filteredData: LeaderboardObject[] = [];

    for (const invite of data.slice(0, top)) {
      let include = true;

      if (excludedMembers.includes(invite.inviter)) {
        include = false;
      } else {
        const member = await interaction.guild!.members.fetch(invite.inviter).catch(() => null);

        if (!leaderboardConfig?.[0]?.left && !member) {
          include = leaderboardConfig.left;
        } else if (member && excludedRoles.length !== 0) {
          const hasExcludedRole = member.roles.cache.some((role) => excludedRoles.includes(role.id));
          include = !hasExcludedRole;
        }
      }

      if (include) {
        filteredData.push(invite);
      }
    }

    if (filteredData.length === 0) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.no_inviter.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.no_inviter.description`, { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    const finalData = filteredData
      .sort((a, b) => b.valid - a.valid)
      .map(({ inviter, valid, total, invalid, bonus, fake }, index) => {
        return i18next.t(`commands.${this.name}.messages.leaderboard.pre_description`, {
          lng: keys.language,
          index: index + 1,
          inviter,
          valid,
          total,
          invalid,
          bonus,
          fake,
        });
      });

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(i18next.t(`commands.${this.name}.messages.leaderboard.title`, { lng: keys.language }))
          .setDescription(
            i18next.t(`commands.${this.name}.messages.leaderboard.description`, {
              lng: keys.language,
              guild: interaction.guild!.name,
              leaderboard: finalData.join("\n"),
              count,
            })
          )
          .setColor(config.message.colors.default)
          .withDefaultFooter(),
      ],
    });
  }

  private async exclude(interaction: Command.ChatInput, keys: Command.Keys) {
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

    const target = interaction.options.getMentionable("mentionable", true) as GuildMember | Role;
    const targetType = target instanceof Role ? "role" : "member";

    const data = await database.query("SELECT 1 FROM leaderboards_exclude WHERE excluded_id = ?", [target.id]);

    if (data !== 0) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.invalid_excluded.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.invalid_excluded.description`, { lng: keys.language }))
            .setColor(config.message.colors.warn)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });
    }

    await database
      .query("INSERT INTO leaderboards_exclude (guild_id, excluded_type, excluded_id) VALUES (?, ?, ?)", [
        interaction.guild!.id,
        targetType,
        target.id,
      ])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.excluded_${targetType}.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.excluded_${targetType}.description`, { lng: keys.language, target: target.id })
              )
              .setColor(config.message.colors.default)
              .withDefaultFooter(),
          ],
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.error_excluded_${targetType}.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.error_excluded_${targetType}.description`, {
                  lng: keys.language,
                  target: target.id,
                })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }

  private async include(interaction: Command.ChatInput, keys: Command.Keys) {
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

    const target = interaction.options.getMentionable("mentionable", true) as GuildMember | Role;
    const targetType = target instanceof Role ? "role" : "member";

    const data = await database.query("SELECT 1 FROM leaderboards_exclude WHERE excluded_id = ?", [target.id]);

    if (data === 0) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.invalid_included.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.invalid_included.description`, { lng: keys.language }))
            .setColor(config.message.colors.warn)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });
    }

    await database
      .query("DELETE FROM leaderboards_exclude WHERE excluded_id", [target.id])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.included_${targetType}.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.included_${targetType}.description`, { lng: keys.language, target: target.id })
              )
              .setColor(config.message.colors.default)
              .withDefaultFooter(),
          ],
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.error_included_${targetType}.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.error_included_${targetType}.description`, {
                  lng: keys.language,
                  target: target.id,
                })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }

  private async top(interaction: Command.ChatInput, keys: Command.Keys) {
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

    const top = interaction.options.get("number", true).value as number;

    if (0 > top || top > 25) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.invalid_top.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.invalid_top.description`, { lng: keys.language }))
            .setColor(config.message.colors.warn)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });
    }

    const query = await database.query("SELECT 1 FROM leaderboards WHERE guild_id = ?", [interaction.guild!.id]).then((data) => {
      if (data.length === 0) {
        return "INSERT INTO leaderboards (display_top, guild_id) VALUES (?, ?)";
      }

      return "UPDATE leaderboards SET display_top = ? WHERE guild_id = ?";
    });

    await database
      .query(query, [top, interaction.guild!.id])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success_top.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.success_top.description`, { lng: keys.language, top }))
              .setColor(config.message.colors.default)
              .withDefaultFooter(),
          ],
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success_top.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.success_top.description`, { lng: keys.language, top }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }

  private async left(interaction: Command.ChatInput, keys: Command.Keys) {
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

    const show = interaction.options.getBoolean("show", true);

    const query = await database.query("SELECT 1 FROM leaderboards WHERE guild_id = ?", [interaction.guild!.id]).then((data) => {
      if (data.length === 0) {
        return "INSERT INTO leaderboards (display_left_inviter, guild_id) VALUES (?, ?)";
      }

      return "UPDATE leaderboards SET display_left_inviter = ? WHERE guild_id = ?";
    });

    await database
      .query(query, [show, interaction.guild!.id])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success_left_${show}.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.success_left_${show}.description`, { lng: keys.language }))
              .setColor(config.message.colors.default)
              .withDefaultFooter(),
          ],
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.error_left.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.error_left.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }
}

export default Leaderboard;
