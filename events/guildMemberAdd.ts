import {
    Events,
    EmbedBuilder,
    GuildMember,
    GuildTextBasedChannel
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import antiBot from "../lib/utils/antiBot";
import inviteHimself from "../lib/utils/inviteHimself";
import youngAccount from "../lib/utils/youngAccount";
import inviteSync from "../lib/sync/invite";
import InviteStats from "../lib/types/interface/InviteStats";
import config from "../config";
import channelSync from "../lib/sync/channel";

export default {
    once: false,
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember, client: MyClient) {
        if (member.user.bot) return antiBot(member, client);

        const channelId = client.cache.channels.get(member.guild.id)?.welcome;
        let isSetup = channelId !== undefined;
        let channel: GuildTextBasedChannel | undefined = undefined;

        if (isSetup) {
            try {
                channel = await member.guild.channels.fetch(channelId!) as GuildTextBasedChannel;
            } catch {
                await channelSync.deleteChannel(true, false, member.guild.id);
                isSetup = false;
            }
        }

        member.guild.invites.fetch()
            .then(async (guildInvites) => {
                const invites = client.cache.invites.get(member.guild.id)!;
                const invite = guildInvites.find((inv) => invites?.get(inv.code)! < inv.uses!)!;

                await guildInvites.each((inv) => invites.set(inv.code, inv.uses!));
                await client.cache.invites.set(member.guild.id, invites);

                try {
                    const inviter = await invite.inviter!;
                    if (inviter.id === member.user.id) return inviteHimself(member, client, true);
                    if (Date.now() - member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 10) return youngAccount(member, inviter, client, true);

                    await inviteSync.setInviter(member.user.id, inviter.id, member.guild.id);

                    if (isSetup) {
                        const invites: InviteStats = await inviteSync.getInvites(inviter.id, member.guild.id);
                        const embed = new EmbedBuilder()
                            .setTitle(`${member.user.tag} joined!`)
                            .setDescription(`**Invited by**: ${inviter.tag}\n**Who now has**: ${invites.invites} invitations\n\n**Account create**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`)
                            .setThumbnail(member.displayAvatarURL())
                            .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                            .setColor("DarkGreen")
                        return channel!.send({embeds: [embed]});
                    }
                } catch (error) {
                    if (isSetup) {
                        const embed = new EmbedBuilder()
                            .setTitle(`${member.user.tag} joined!`)
                            .setDescription(`**Invited by**: Unknow inviter\n**Account create**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n\n_Maybe he used a temporary or vanity invitation_`)
                            .setThumbnail(member.displayAvatarURL())
                            .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                            .setColor("Red")
                        if (config.handleError) embed.addFields({name: "Console", value: error as string})
                        return channel!.send({embeds: [embed]});
                    }
                }
            });
    }
}
