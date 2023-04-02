import {Events, EmbedBuilder, GuildMember, User, GuildTextBasedChannel} from "discord.js";
import MyClient from "../ts/class/MyClient";
import invitesync from "../utils/invitesync";
import inviteHimself from "../security/inviteHimself";
import youngAccount from "../security/youngAccount";
import InviteStats from "../ts/interface/InviteStats";
import config from "../config";
import channelsync from "../utils/channelsync";

export default {
    once: false,
    name: Events.GuildMemberRemove,
    async execute(member: GuildMember, client: MyClient) {
        let isSetup = true;
        const channel = await member.guild.channels.fetch(client.cache.get(member.guild.id)!.leave!).catch(async () => {
            await channelsync.deleteChannel(false, true, member.guild.id);
            isSetup = false
        }) as GuildTextBasedChannel;

        if (member.user.bot && isSetup) {
            const embed = new EmbedBuilder()
                .setTitle(`${member.user.tag} left!`)
                .setDescription(`**Bot User**\n**Account create**: <t:${Math.floor(member.user.createdTimestamp) / 1000}:R>`)
                .setThumbnail(member.displayAvatarURL())
                .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                .setColor("Yellow")
            return channel.send({embeds: [embed]});
        }

        try {
            const inviter: User = await invitesync.getInviter(member.user.id, member.guild.id)
                .then((u) => client.users.fetch(u));
            if (inviter.id === member.user.id) return inviteHimself(member, client, false);
            if (Date.now() - member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 10) return youngAccount(member, inviter, client, false);

            await invitesync.removeInvite(member.user.id, inviter.id, member.guild.id);
            if (isSetup) {
                const invites: InviteStats = await invitesync.getInvites(inviter.id, member.guild.id);
                const embed = new EmbedBuilder()
                    .setTitle(`${member.user.tag} left!`)
                    .setDescription(`**Invited by**: ${inviter.tag}\n**Who now has**: ${invites.invites} invitations\n\n**Account create**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`)
                    .setThumbnail(member.displayAvatarURL())
                    .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                    .setColor("Red")
                return channel.send({embeds: [embed]});
            }
        } catch (error) {
            if (isSetup) {
                const embed = new EmbedBuilder()
                    .setTitle(`${member.user.tag} left!`)
                    .setDescription(`**Invited by**: Unknow inviter\n**Account create**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n\n_Maybe he used a temporary or vanity invitation_`)
                    .setThumbnail(member.displayAvatarURL())
                    .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                    .setColor("Red")
                config.handleError ?
                    embed.addFields({name: "Console", value: error as string}) :
                    console.error(error);
                return channel.send({embeds: [embed]});
            }
            console.error(error);
        }
    }
}
