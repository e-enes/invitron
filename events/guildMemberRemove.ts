import {Events, EmbedBuilder, GuildMember, TextChannel, User} from "discord.js";
import MyClient from "../ts/class/MyClient";
import invitesync from "../utils/invitesync";
import inviteHimself from "../security/inviteHimself";
import youngAccount from "../security/youngAccount";
import InviteStats from "../ts/interface/InviteStats";
import config from "../config";

export default {
    once: false,
    name: Events.GuildMemberRemove,
    async execute(member: GuildMember, client: MyClient) {
        const channel = await client.channels.fetch(config.channel.leave) as TextChannel;

        if (member.user.bot) {
            const embed = new EmbedBuilder()
                .setTitle(`${member.user.tag} left!`)
                .setDescription(
                    `
                    **Bot User**\n
                    **Account create**: <t:${Math.floor(member.user.createdTimestamp) / 1000}:R>
                    `
                )
                .setThumbnail(member.displayAvatarURL())
                .setFooter({text: "Powored by Sene", iconURL: client.user!.displayAvatarURL()})
                .setColor("Yellow")
            return channel.send({embeds: [embed]});
        }

        try {
            const inviter: User = await invitesync.getInviter(member.user.id, member.guild.id)
                .then((u) => client.users.fetch(u));
            if (inviter.id === member.user.id) return inviteHimself(member, client, false);
            if (Date.now() - member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 10) return youngAccount(member, inviter, client, false);

            await invitesync.removeInvite(member.user.id, inviter.id, member.guild.id);
            const invites: InviteStats = await invitesync.getInvites(inviter.id, member.guild.id);

            const embed = new EmbedBuilder()
                .setTitle(`${member.user.tag} left!`)
                .setDescription(
                    `
                    **Invited by**: ${inviter.tag}
                    **Who now has: ${invites.invites} invitations
                    **Account create**: <t:${Math.floor(member.user.createdTimestamp) / 1000}:R>
                    `
                )
                .setThumbnail(member.displayAvatarURL())
                .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
                .setColor("Red")
            return channel.send({embeds: [embed]});
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle(`${member.user.tag} left!`)
                .setDescription(
                    `
                    **Invited by**: Unknow inviter
                    **Account create**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>
                    `
                )
                .setThumbnail(member.displayAvatarURL())
                .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
                .setColor("Red")
            return channel.send({embeds: [embed]});
        }
    }
};
