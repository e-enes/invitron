import { EmbedBuilder, Events, GuildMember, GuildTextBasedChannel } from "discord.js";
import i18next from "i18next";

import Listener from "../../Listener.js";
import { ContextGuildMember } from "../../../types";

class GuildMemberRemove extends Listener {
  public constructor() {
    super(Events.GuildMemberRemove);
  }

  public override async execute(member: GuildMember) {
    const { database, config } = this.client;

    const context = await this.getContext(member.guild.id);

    if (member.user.bot) {
      await context.send?.({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`events.${this.name}.messages.bot.title`, { lng: context.language }))
            .setDescription(
              i18next.t(`events.${this.name}.messages.bot.description`, {
                lng: context.language,
                member: member.user.id,
                createdAt: Math.floor(member.user.createdTimestamp / 1000),
              })
            )
            .setColor(config.message.colors.warn)
            .setThumbnail(member.displayAvatarURL({ forceStatic: true }))
            .withDefaultFooter(),
        ],
      });

      return;
    }

    const data = await database
      .query(
        "SELECT inviter_id AS inviter, inactive, code FROM invites WHERE guild_id = ? AND member_id = ? ORDER BY created_at DESC LIMIT 1",
        [member.guild.id, member.user.id]
      )
      .catch(() => void 0);

    if (!data || data.length === 0 || data[0].inactive) {
      if (!data || data.length === 0 || !data[0].inactive) {
        await database.query("INSERT INTO invites (guild_id, member_id, inactive) VALUES (?, ?, ?)", [
          member.guild.id,
          member.user.id,
          true,
        ]);
      }

      await context.send?.({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`events.${this.name}.messages.invalid.title`, { lng: context.language }))
            .setDescription(
              i18next.t(`events.${this.name}.messages.invalid.description`, {
                lng: context.language,
                member: member.user.id,
                createdAt: Math.floor(member.user.createdTimestamp / 1000),
              })
            )
            .setColor(config.message.colors.error)
            .setThumbnail(member.displayAvatarURL({ forceStatic: true }))
            .withDefaultFooter(),
        ],
      });

      return;
    }

    const [row] = data;

    await database.query("UPDATE invites SET inactive = true WHERE guild_id = ? AND inviter_id = ? AND member_id = ?", [
      member.guild.id,
      row.inviter,
      member.user.id,
    ]);

    if (row.inviter === member.guild.id) {
      await context.send?.({
        embeds: [
          new EmbedBuilder()
            .setTitle(i18next.t(`events.${this.name}.messages.vanity.title`, { lng: context.language }))
            .setDescription(
              i18next.t(`events.${this.name}.messages.vanity.description`, {
                lng: context.language,
                member: member.user.id,
                createdAt: Math.floor(member.user.createdTimestamp / 1000),
              })
            )
            .setColor(config.message.colors.error)
            .setThumbnail(member.displayAvatarURL({ forceStatic: true }))
            .withDefaultFooter(),
        ],
      });
    } else {
      const source = this.client.invites.get(member.guild.id)!.get(row.code)?.source;

      const preInvites = (
        await database
          .query(
            "SELECT COALESCE(SUM(CASE WHEN I.inactive = 0 AND I.fake = 0 THEN 1 ELSE 0 END), 0) AS valid, COALESCE((SELECT SUM(B.bonus) FROM bonus B WHERE B.guild_id = ? AND B.inviter_id = ?), 0) AS bonus FROM invites I WHERE I.guild_id = ? AND I.inviter_id = ?",
            [member.guild.id, row.inviter, member.guild.id, row.inviter]
          )
          .catch(() => void 0)
      )?.[0];
      const invites = preInvites?.valid + preInvites?.bonus;

      const inviter = member.guild.members.cache.get(row.inviter) || (await member.guild.members.fetch(row.inviter));

      await this.updateRole(member.guild.id, inviter, invites);

      if (source) {
        await context.send?.({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`events.${this.name}.messages.valid_source.title`, { lng: context.language }))
              .setDescription(
                i18next.t(`events.${this.name}.messages.valid_source.description`, {
                  lng: context.language,
                  member: member.user.id,
                  inviter: row.inviter,
                  invites,
                  source,
                  createdAt: Math.floor(member.user.createdTimestamp / 1000),
                })
              )
              .setColor(config.message.colors.error)
              .setThumbnail(member.displayAvatarURL({ forceStatic: true }))
              .withDefaultFooter(),
          ],
        });
      } else {
        await context.send?.({
          embeds: [
            new EmbedBuilder()
              .setTitle(i18next.t(`events.${this.name}.messages.valid.title`, { lng: context.language }))
              .setDescription(
                i18next.t(`events.${this.name}.messages.valid.description`, {
                  lng: context.language,
                  member: member.user.id,
                  inviter: row.inviter,
                  invites,
                  code: row.code,
                  createdAt: Math.floor(member.user.createdTimestamp / 1000),
                })
              )
              .setColor(config.message.colors.error)
              .setThumbnail(member.displayAvatarURL({ forceStatic: true }))
              .withDefaultFooter(),
          ],
        });
      }
    }
  }

  private async getContext(guildId: string): Promise<Partial<ContextGuildMember>> {
    const { database } = this.client;

    const data = await database
      .query(
        "SELECT G.language AS language, C.channel_id AS send FROM guilds G LEFT JOIN channels C ON G.guild_id = C.guild_id AND C.channel_type = 'leave' AND C.active = true LEFT JOIN fakes F ON F.guild_id = G.guild_id WHERE G.guild_id = ?",
        [guildId]
      )
      .catch(() => void 0);

    if (!data || data.length === 0) {
      return {};
    }

    const [row] = data;

    if (row.send) {
      const channel = (await this.client.channels.fetch(row.send, { cache: true }).catch(() => {
        database.query("DELETE FROM channels WHERE channel_id = ?", [row.send]);
      })) as GuildTextBasedChannel;

      if (channel) {
        row.send = channel.send.bind(channel);
      }
    }

    return row;
  }

  private async updateRole(guildId: string, inviter: GuildMember, invites: number) {
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

    const { keepRole, stackedRole } = data[0];
    const currentRoles = inviter.roles.cache;

    let rolesToAdd: string[] = [];
    let rolesToRemove: string[] = [];

    for (const { role, requiredInvitations } of data) {
      const hasRole = currentRoles.has(role);
      const meetsRequirement = invites >= requiredInvitations;

      if (meetsRequirement && !hasRole) {
        rolesToAdd.push(role);
      } else if (!meetsRequirement && hasRole && !keepRole) {
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

export default GuildMemberRemove;
