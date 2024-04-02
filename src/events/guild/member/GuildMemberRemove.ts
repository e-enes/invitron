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
            .setTitle(i18next.t(`events.${this.name}.messages.bot.title`, { lng: context.language }))
            .setDescription(
              i18next.t(`events.${this.name}.messages.bot.description`, {
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
      const invites =
        (
          await database
            .query(
              "SELECT COUNT(inviter_id) AS invites FROM invites WHERE guild_id = ? AND inviter_id = ? AND inactive = false AND fake = false",
              [member.guild.id, row.inviter]
            )
            .catch(() => void 0)
        )?.[0].invites || 0;
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
        "SELECT role_id AS role, number_invitations AS requiredInvitations FROM roles WHERE guild_id = ? AND active = true GROUP BY role",
        [guildId]
      )
      .catch(() => void 0);

    if (!data || data.length === 0) {
      return;
    }

    data
      .filter(({ role, requiredInvitations }) => {
        const hasRoleAlready = inviter.roles.cache.some((roleCache) => roleCache.id === role);
        const hasEnoughInvites = invites >= requiredInvitations;
        return !hasRoleAlready && hasEnoughInvites;
      })
      .forEach(async ({ role }) => await inviter.roles.add(role).catch(() => void 0));
  }
}

export default GuildMemberRemove;
