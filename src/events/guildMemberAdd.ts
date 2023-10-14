import { Events, EmbedBuilder, GuildMember, Invite, User } from "discord.js";

import Client from "../client";
import { InviteStats } from "../types";
import inviteSync from "../utils/invite";
import { isBot } from "../utils/helpers/bot";
import { isAged, isValidInviter } from "../utils/helpers/invited";
import { isSetup } from "../utils/helpers/guild";
import config from "../../config";

export default {
  once: false,
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember, client: Client): Promise<void> {
    if (member.user.bot) {
      await isBot(member, client);
      return;
    }

    const guildId = member.guild.id;
    const channels = client.getChannels(guildId)!;
    const { setup, channel } = await isSetup(
      channels.welcome,
      "welcome",
      channels.setup,
      guildId,
      client
    );

    member.guild.invites.fetch().then(async guildInvites => {
      const invites = client.getInvites(guildId)!;
      const invite: Invite = guildInvites.find(inv => invites?.get(inv.code)!.uses < inv.uses!)!;
      const inviter: User = await client.users.fetch(invites.get(invite.code)!.memberId);

      client.setInvite(guildId, invite.code, { uses: invite.uses!, memberId: inviter.id });

      try {
        if (inviter.id === member.user.id) {
          await inviteSync.add(member.user.id, inviter.id, guildId, invite!.code, true);
          await isValidInviter(member, client, true);
          return;
        }
        if (Date.now() - member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 10) {
          await inviteSync.add(member.user.id, inviter.id, guildId, invite!.code, true);
          await isAged(member, inviter, client, true);
          return;
        }

        await inviteSync.add(member.user.id, inviter.id, guildId, invite!.code, false);

        if (setup && channel != null) {
          const invites: InviteStats = await inviteSync.getInvites(inviter.id, guildId);
          const embed = new EmbedBuilder()
            .setTitle(`${member.user.username} joined!`)
            .setDescription(
              `**Invited by**: ${inviter.username}\n**Who now has**: ${
                invites.invites
              } invitations\n\n**Account create**: <t:${Math.floor(
                member.user.createdTimestamp / 1000
              )}:R>`
            )
            .setThumbnail(member.displayAvatarURL())
            .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
            .setColor("DarkGreen");
          await channel.send({ embeds: [embed] });
          return;
        }
      } catch (error) {
        if (setup && channel != null) {
          const embed = new EmbedBuilder()
            .setTitle(`${member.user.username} joined!`)
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
          await channel.send({ embeds: [embed] });
        }
      }
    });
  },
};
