import { Events, EmbedBuilder, GuildMember, User } from "discord.js";

import Client from "../client";
import { InviteStats } from "../types";
import inviteSync from "../utils/invite";
import { isAged, isValidInviter } from "../utils/helpers/invited";
import { isSetup } from "../utils/helpers/guild";
import config from "../../config";

export default {
  once: false,
  name: Events.GuildMemberRemove,
  async execute(member: GuildMember, client: Client): Promise<void> {
    const guildId = member.guild.id;
    const channels = client.getChannels(guildId)!;
    const { setup, channel } = await isSetup(
      channels.leave,
      "leave",
      channels.setup,
      guildId,
      client
    );

    if (member.user.bot && setup && channel != null) {
      const embed = new EmbedBuilder()
        .setTitle(`${member.user.tag} left!`)
        .setDescription(
          `**Bot User**\n**Account create**: <t:${
            Math.floor(member.user.createdTimestamp) / 1000
          }:R>`
        )
        .setThumbnail(member.displayAvatarURL())
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("Yellow");
      await channel.send({ embeds: [embed] });
      return;
    }

    try {
      const inviter: User = await inviteSync
        .getInviter(member.user.id, member.guild.id)
        .then(u => client.users.fetch(u));
      await inviteSync.remove(member.user.id, inviter.id, member.guild.id);

      if (inviter.id === member.user.id) {
        await isValidInviter(member, client, false);
        return;
      }

      if (Date.now() - member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 10) {
        await isAged(member, inviter, client, false);
        return;
      }

      if (setup && channel != null) {
        const invites: InviteStats = await inviteSync.getInvites(inviter.id, member.guild.id);
        const embed = new EmbedBuilder()
          .setTitle(`${member.user.username} left!`)
          .setDescription(
            `**Invited by**: ${inviter.username}\n**Who now has**: ${
              invites.invites
            } invitations\n\n**Account create**: <t:${Math.floor(
              member.user.createdTimestamp / 1000
            )}:R>`
          )
          .setThumbnail(member.displayAvatarURL())
          .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
          .setColor("Red");
        await channel.send({ embeds: [embed] });
        return;
      }
    } catch (error) {
      if (setup && channel != null) {
        const embed = new EmbedBuilder()
          .setTitle(`${member.user.username} left!`)
          .setDescription(
            `**Invited by**: Unknow inviter\n**Account create**: <t:${Math.floor(
              member.user.createdTimestamp / 1000
            )}:R>\n\n_Maybe he used a temporary or vanity invitation_`
          )
          .setThumbnail(member.displayAvatarURL())
          .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
          .setColor("Red");
        if (config.handleError) {
          embed.addFields({ name: "Console", value: (error as Error).message });
        }
        await channel!.send({ embeds: [embed] });
      }
    }
  },
};
