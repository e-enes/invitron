import { ActionRowBuilder, ButtonBuilder, ContextMenuCommandBuilder, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { ApplicationCommandType, ButtonStyle, PermissionFlagsBits } from "discord-api-types/v10";
import i18next from "i18next";

import Command from "../Command.js";
import { localizations } from "../../utils/translations/localizations.js";

class Invites extends Command {
  public constructor() {
    super("invites");
  }

  public override initialize() {
    const { description, subcommands } = localizations.get(this.name)!;

    this.applicationCommands.push(
      new SlashCommandBuilder()
        .setName(this.name)
        .setDescription("Manage invitations")
        .setDescriptionLocalizations(description)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("view")
            .setDescription("View invitation")
            .setDescriptionLocalizations(subcommands!.view.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.view.options!.member.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add invitation to a member")
            .setDescriptionLocalizations(subcommands!.add.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.add.options!.member.description)
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of invitations to add")
                .setDescriptionLocalizations(subcommands!.add.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove invitation to a member")
            .setDescriptionLocalizations(subcommands!.remove.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.remove.options!.member.description)
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("number")
                .setDescription("Number of invitations to remove")
                .setDescriptionLocalizations(subcommands!.remove.options!.number.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("reset")
            .setDescription("Reset a member's invitations")
            .setDescriptionLocalizations(subcommands!.reset.description)
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.reset.options!.member.description)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("create")
            .setDescription("Create an invitation link that never expires")
            .setDescriptionLocalizations(subcommands!.create.description)
            .addStringOption((option) =>
              option
                .setName("source")
                .setDescription("Set a source")
                .setDescriptionLocalizations(subcommands!.create.options!.source.description)
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("check")
            .setDescription("Discover which members hava utilized this code or identify the member associated with it")
            .setDescriptionLocalizations(subcommands!.check.description)
            .addStringOption((option) =>
              option
                .setName("code")
                .setDescription("Code (without discord.gg/)")
                .setDescriptionLocalizations(subcommands!.check.options!.code.description)
                .setRequired(false)
            )
            .addUserOption((option) =>
              option
                .setName("member")
                .setDescription("Mention a server member")
                .setDescriptionLocalizations(subcommands!.check.options!.member.description)
                .setRequired(false)
            )
        )
        .toJSON(),
      new ContextMenuCommandBuilder().setName(this.name).setType(ApplicationCommandType.User).toJSON()
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

  public override async executeUserContextMenu(interaction: Command.UserContextMenu, keys: Command.Keys) {
    await this.view(interaction, keys);
  }

  private async view(interaction: Command.ChatInput | Command.UserContextMenu, keys: Command.Keys) {
    const { database, config } = this.client;

    const member =
      interaction?.["targetId"] ?? (interaction.options.getMember("member") as GuildMember)?.user.id ?? interaction.member?.user.id;

    await database
      .query(
        "SELECT COUNT(I.inviter_id) AS total, COALESCE(SUM(CASE WHEN I.inactive = 0 AND I.fake = 0 THEN 1 ELSE 0 END), 0) AS valid, COALESCE(SUM(CASE WHEN I.inactive = 1 AND I.fake = 0 THEN 1 ELSE 0 END), 0) AS invalid, COALESCE(SUM(CASE WHEN I.fake = 1 THEN 1 ELSE 0 END), 0) AS fake, COALESCE((SELECT SUM(B.bonus) FROM bonus B WHERE B.guild_id = ? AND B.inviter_id = ?), 0) AS bonus FROM invites I WHERE I.guild_id = ? AND I.inviter_id = ?",
        [interaction.guild!.id, member, interaction.guild!.id, member]
      )
      .then(([{ total, valid, invalid, fake, bonus }]) => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success_view.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.success_view.description`, {
                  lng: keys.language,
                  member,
                  valid: valid + bonus,
                  total,
                  invalid,
                  bonus,
                  fake,
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
              .setTitle(i18next.t(`commands.${this.name}.messages.error_view.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.error_view.description`, {
                  lng: keys.language,
                  member,
                })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      });
  }

  private async add(interaction: Command.ChatInput, keys: Command.Keys) {
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

    const target = interaction.options.getMember("member") as GuildMember;
    const number = interaction.options.get("number", true).value as number;

    if (number <= 0 || number >= 2 ** 31 - 1) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.invalid_bonus.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.invalid_bonus.description`, { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    await database
      .query("INSERT INTO bonus (guild_id, inviter_id, bonus) VALUES (?, ?, ?)", [interaction.guild!.id, target.user.id, number])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success_bonus_add.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.success_bonus_add.description`, {
                  lng: keys.language,
                  member: target.user.id,
                  number,
                })
              )
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
        });

        this.updateRole(interaction.guild!.id, target);
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.error_bonus.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.error_bonus.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
        });
      });
  }

  private async remove(interaction: Command.ChatInput, keys: Command.Keys) {
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

    const target = interaction.options.getMember("member") as GuildMember;
    const number = interaction.options.get("number", true).value as number;

    if (number <= 0 || number >= 2 ** 31 - 1) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.invalid_bonus.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.invalid_bonus.description`, { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });

      return;
    }

    await database
      .query("INSERT INTO bonus (guild_id, inviter_id, bonus) VALUES (?, ?, ?)", [interaction.guild!.id, target.user.id, -number])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success_bonus_remove.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.success_bonus_remove.description`, {
                  lng: keys.language,
                  member: target.user.id,
                  number,
                })
              )
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
        });

        this.updateRole(interaction.guild!.id, target);
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.error_bonus.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.error_bonus.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
        });
      });
  }

  private async reset(interaction: Command.ChatInput, keys: Command.Keys) {
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

    const target = interaction.options.getMember("member") as GuildMember;

    await database
      .query("DELETE FROM invites WHERE guild_id = ? AND inviter_id = ?", [interaction.guild!.id, target.user.id])
      .then(async () => {
        await database.query("DELETE FROM bonus WHERE guild_id = ? AND inviter_id = ?", [interaction.guild!.id, target.user.id]);
      })
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success_reset.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.success_reset.description`, { lng: keys.language, member: target.user.id })
              )
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
        });

        this.updateRole(interaction.guild!.id, target);
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.error_reset.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.error_reset.description`, { lng: keys.language, member: target.user.id })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
        });
      });
  }

  private async create(interaction: Command.ChatInput, keys: Command.Keys) {
    const { database, config } = this.client;

    const member = interaction.member as GuildMember;
    const source = interaction.options.getString("source");

    const data = await database.query("SELECT link, source FROM links WHERE member_id = ? AND guild_id = ?", [
      member.user.id,
      interaction.guild!.id,
    ]);

    if (data.length !== 0) {
      if (source && data[0].source !== source) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.updated_link.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.updated_link.description`, {
                  lng: keys.language,
                  link: data[0].link,
                  source: source,
                })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId(`invites:${data[0].link}:${source.replace(" ", "_")}:${interaction.member!.user.id}`)
                .setLabel(i18next.t(`components.${this.name}.button.update.label`, { lng: keys.language }))
                .setStyle(ButtonStyle.Danger)
            ),
          ],
        });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.existed_link.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.existed_link.description`, { lng: keys.language, link: data[0].link })
              )
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
          ephemeral: true,
        });
      }

      return;
    }

    const invite = await interaction
      .guild!.invites.create(interaction.channel!.id, {
        maxAge: 0,
        temporary: false,
        unique: true,
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.unable_create_link.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.unable_create_link.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
        });
      });

    if (!invite) {
      return;
    }

    await database
      .query("INSERT INTO links (guild_id, member_id, link, source) VALUES (?, ?, ?, ?)", [
        interaction.guild!.id,
        member.user.id,
        invite.code,
        source ? source : null,
      ])
      .then(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.success_link.title`, { lng: keys.language }))
              .setDescription(
                i18next.t(`commands.${this.name}.messages.success_link.description`, { lng: keys.language, link: invite.code })
              )
              .setColor(config.message.colors.success)
              .withDefaultFooter(),
          ],
        });

        this.client.invites.get(interaction.guild!.id)!.set(invite.code, {
          member: member.user.id,
          uses: 0,
          source: source ? source : undefined,
        });
      })
      .catch(() => {
        invite.delete().catch(() => void 0);

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`commands.${this.name}.messages.error_link.title`, { lng: keys.language }))
              .setDescription(i18next.t(`commands.${this.name}.messages.error_link.description`, { lng: keys.language }))
              .setColor(config.message.colors.error)
              .withDefaultFooter(),
          ],
        });
      });
  }

  private async check(interaction: Command.ChatInput, keys: Command.Keys) {
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

    const target = interaction.options.getMember("member") as GuildMember;
    const code = interaction.options.getString("code");

    if (!target && !code) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`commands.${this.name}.messages.invalid_check.title`, { lng: keys.language }))
            .setDescription(i18next.t(`commands.${this.name}.messages.invalid_check.description`, { lng: keys.language }))
            .setColor(config.message.colors.error)
            .withDefaultFooter(),
        ],
        ephemeral: true,
      });
    }

    if (target) {
      let query =
        "SELECT I.inviter_id  AS inviter, I.inactive AS inactive, I.fake AS fake, I.code AS code, I.created_at AS createdAt FROM invites I WHERE I.guild_id = ? AND I.member_id = ?";
      const params = [interaction.guild!.id, target.user.id];

      if (code) {
        query += " AND I.code = ?";
        params.push(code);
      }

      query += " ORDER BY createdAt DESC LIMIT 1";

      await database
        .query(query, params)
        .then((data) => {
          if (data.length === 0) {
            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(i18next.t(`commands.${this.name}.messages.no_member_check.title`, { lng: keys.language }))
                  .setDescription(i18next.t(`commands.${this.name}.messages.no_member_check.description`, { lng: keys.language }))
                  .setColor(config.message.colors.error)
                  .withDefaultFooter(),
              ],
              ephemeral: true,
            });

            return;
          }

          const [{ inviter, inactive, fake, code, createdAt }] = data;

          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(i18next.t(`commands.${this.name}.messages.success_member_check.title`, { lng: keys.language }))
                .setDescription(
                  i18next.t(`commands.${this.name}.messages.success_member_check.description`, {
                    lng: keys.language,
                    member: target.user.id,
                    inviter,
                    inactive: inactive == true,
                    fake: fake == true,
                    code,
                    createdAt: Math.floor(new Date(createdAt + "Z").getTime() / 1000),
                  })
                )
                .setColor(config.message.colors.success)
                .withDefaultFooter(),
            ],
            ephemeral: true,
          });
        })
        .catch(() => {
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(i18next.t(`commands.${this.name}.messages.error_check.title`, { lng: keys.language }))
                .setDescription(i18next.t(`commands.${this.name}.messages.error_check.description`, { lng: keys.language }))
                .setColor(config.message.colors.success)
                .withDefaultFooter(),
            ],
            ephemeral: true,
          });
        });

      return;
    }

    if (code) {
      await database
        .query("SELECT I.member_id AS member, I.fake AS fake FROM invites I WHERE I.guild_id = ? AND I.code = ? AND inactive = false", [
          interaction.guild!.id,
          code,
        ])
        .then(async (data) => {
          if (data.length === 0) {
            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(i18next.t(`commands.${this.name}.messages.no_member_check.title`, { lng: keys.language }))
                  .setDescription(i18next.t(`commands.${this.name}.messages.no_member_check.description`, { lng: keys.language }))
                  .setColor(config.message.colors.error)
                  .withDefaultFooter(),
              ],
              ephemeral: true,
            });

            return;
          }

          const members = (
            await Promise.all(
              data.map(async ({ member, fake }) => {
                return await this.client.users
                  .fetch(member, { cache: true })
                  .then((user) => {
                    return fake ? `${user.username} (fake)` : user.username;
                  })
                  .catch(() => void 0);
              })
            )
          )
            .filter(Boolean)
            .join(", ");

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(i18next.t(`commands.${this.name}.messages.success_code_check.title`, { lng: keys.language }))
                .setDescription(i18next.t(`commands.${this.name}.messages.success_code_check.description`, { lng: keys.language, members }))
                .setColor(config.message.colors.success)
                .withDefaultFooter(),
            ],
            ephemeral: true,
          });
        })
        .catch(() => {
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(i18next.t(`commands.${this.name}.messages.error_check.title`, { lng: keys.language }))
                .setDescription(i18next.t(`commands.${this.name}.messages.error_check.description`, { lng: keys.language }))
                .setColor(config.message.colors.success)
                .withDefaultFooter(),
            ],
            ephemeral: true,
          });
        });
    }
  }

  private async updateRole(guildId: string, inviter: GuildMember) {
    const { database } = this.client;

    const data = await database
      .query(
        "SELECT R.role_id AS role, R.number_invitations AS requiredInvitations, RC.keep_role AS keepRole, RC.stacked_role AS stackedRole FROM roles R LEFT JOIN roles_configuration RC ON R.guild_id = RC.guild_id WHERE R.guild_id = ? AND R.active = true GROUP BY R.role_id",
        [guildId]
      )
      .catch(() => void 0);

    if (!data || data.length === 0) {
      return;
    }

    const preInvites = (
      await database
        .query(
          "SELECT COALESCE(SUM(CASE WHEN I.inactive = 0 AND I.fake = 0 THEN 1 ELSE 0 END), 0) AS valid, COALESCE((SELECT SUM(B.bonus) FROM bonus B WHERE B.guild_id = ? AND B.inviter_id = ?), 0) AS bonus FROM invites I WHERE I.guild_id = ? AND I.inviter_id = ?",
          [guildId, inviter.id, guildId, inviter.id]
        )
        .catch(() => void 0)
    )?.[0];

    const invites = preInvites?.valid + preInvites?.bonus;

    const { keepRole, stackedRole } = data[0];
    const currentRoles = inviter.roles.cache;

    let rolesToAdd: string[] = [];
    let rolesToRemove: string[] = [];

    for (const { role, requiredInvitations } of data) {
      const hasRole = currentRoles.has(role);
      const meetsRequirement = invites >= requiredInvitations;

      if (meetsRequirement && !hasRole) {
        console.log("add", role, invites, requiredInvitations);
        rolesToAdd.push(role);
      } else if (!meetsRequirement && hasRole && !keepRole) {
        console.log("remove", role, invites, requiredInvitations);
        rolesToRemove.push(role);
      }
    }

    if (!stackedRole) {
      const highestRequiredInvitations = Math.max(...rolesToAdd.map((role) => data.find((r) => r.role === role).requiredInvitations));
      rolesToAdd = rolesToAdd.filter((role) => data.find((r) => r.role === role).requiredInvitations === highestRequiredInvitations);

      rolesToRemove = rolesToRemove.concat(
        currentRoles
          .filter((roleCache) => {
            const roleData = data.find((r) => r.role === roleCache.id);
            return roleData && roleData.requiredInvitations < highestRequiredInvitations;
          })
          .map((roleCache) => roleCache.id)
      );
    }

    rolesToRemove = rolesToRemove.filter((role) => !rolesToAdd.includes(role));

    await Promise.allSettled([
      ...rolesToAdd.map((role) => inviter.roles.add(role)),
      ...rolesToRemove.map((role) => inviter.roles.remove(role)),
    ]);
  }
}

export default Invites;
