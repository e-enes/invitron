import {Events, EmbedBuilder, GuildMember, GuildTextBasedChannel} from "discord.js";
import MyClient from "../ts/class/MyClient";
import antiBot from "../security/antiBot";
import inviteHimself from "../security/inviteHimself";
import youngAccount from "../security/youngAccount";
import invitesync from "../utils/invitesync";
import InviteStats from "../ts/interface/InviteStats";
import config from "../config";
import channelsync from "../utils/channelsync";

export default {
    once: false,
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember, client: MyClient) {
        if (member.user.bot) return antiBot(member, client);

        let isSetup = true;
        const channel = await member.guild.channels.fetch(client.cache.get(member.guild.id)!.welcome!).catch(async () => {
            await channelsync.deleteChannel(true, false, member.guild.id);
            isSetup = false
        }) as GuildTextBasedChannel;

        member.guild.invites.fetch()
            .then(async (guildInvites) => {
                const invites = client.invites.get(member.guild.id)!;
                const invite = guildInvites.find((inv) => invites?.get(inv.code)! < inv.uses!)!;

                await guildInvites.each((inv) => invites.set(inv.code, inv.uses!));
                await client.invites.set(member.guild.id, invites);

                try {
                    const inviter = await invite.inviter!;
                    if (inviter.id === member.user.id) return inviteHimself(member, client, true);
                    if (Date.now() - member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 10) return youngAccount(member, inviter, client, true);

                    await invitesync.setInviter(member.user.id, inviter.id, member.guild.id);

                    if (isSetup) {
                        const invites: InviteStats = await invitesync.getInvites(inviter.id, member.guild.id);
                        const embed = new EmbedBuilder()
                            .setTitle(`${member.user.tag} joined!`)
                            .setDescription(`**Invited by**: ${inviter.tag}\n**Who now has**: ${invites.invites} invitations\n\n**Account create**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`)
                            .setThumbnail(member.displayAvatarURL())
                            .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                            .setColor("DarkGreen")
                        return channel.send({embeds: [embed]});
                    }
                } catch (error) {
                    if (isSetup) {
                        const embed = new EmbedBuilder()
                            .setTitle(`${member.user.tag} joined!`)
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
            });
    }
}
