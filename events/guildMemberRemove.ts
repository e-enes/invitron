import {
    Events,
    EmbedBuilder,
    GuildMember,
    User,
    GuildTextBasedChannel
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import inviteSync from "../lib/sync/invite";
import inviteHimself from "../lib/utils/inviteHimself";
import youngAccount from "../lib/utils/youngAccount";
import InviteStats from "../lib/types/interface/InviteStats";
import config from "../config";
import channelSync from "../lib/sync/channel";

export default {
    once: false,
    name: Events.GuildMemberRemove,
    async execute(member: GuildMember, client: MyClient) {
        const channelId = client.cache.channels.get(member.guild.id)?.leave;
        let isSetup = channelId !== undefined;
        let channel: GuildTextBasedChannel | undefined = undefined;

        if (isSetup) {
            try {
                channel = await member.guild.channels.fetch(channelId!) as GuildTextBasedChannel;
            } catch {
                await channelSync.deleteChannel(false, true, member.guild.id);
                isSetup = false;
            }
        }

        if (member.user.bot && isSetup) {
            const embed = new EmbedBuilder()
                .setTitle(`${member.user.tag} left!`)
                .setDescription(`**Bot User**\n**Account create**: <t:${Math.floor(member.user.createdTimestamp) / 1000}:R>`)
                .setThumbnail(member.displayAvatarURL())
                .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                .setColor("Yellow")
            return channel!.send({embeds: [embed]});
        }

        try {
            const inviter: User = await inviteSync.getInviter(member.user.id, member.guild.id)
                .then((u) => client.users.fetch(u));
            if (inviter.id === member.user.id) return inviteHimself(member, client, false);
            if (Date.now() - member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 10) return youngAccount(member, inviter, client, false);

            await inviteSync.removeInvite(member.user.id, inviter.id, member.guild.id);
            if (isSetup) {
                const invites: InviteStats = await inviteSync.getInvites(inviter.id, member.guild.id);
                const embed = new EmbedBuilder()
                    .setTitle(`${member.user.tag} left!`)
                    .setDescription(`**Invited by**: ${inviter.tag}\n**Who now has**: ${invites.invites} invitations\n\n**Account create**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`)
                    .setThumbnail(member.displayAvatarURL())
                    .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                    .setColor("Red")
                return channel!.send({embeds: [embed]});
            }
        } catch (error) {
            if (isSetup) {
                const embed = new EmbedBuilder()
                    .setTitle(`${member.user.tag} left!`)
                    .setDescription(`**Invited by**: Unknow inviter\n**Account create**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n\n_Maybe he used a temporary or vanity invitation_`)
                    .setThumbnail(member.displayAvatarURL())
                    .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                    .setColor("Red")
                if (config.handleError) embed.addFields({name: "Console", value: error as string})
                return channel!.send({embeds: [embed]});
            }
        }
    }
}
