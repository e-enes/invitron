import {
    EmbedBuilder,
    GuildMember,
    GuildTextBasedChannel,
    User
} from "discord.js";
import MyClient from "../types/class/MyClient";
import config from "../../config";
import channelSync from "../sync/channel";

export default async function antiBot(member: GuildMember, inviter: User, client: MyClient, joined: boolean) {
    const channelId = joined ? client.cache.channels.get(member.guild.id)?.welcome : client.cache.channels.get(member.guild.id)?.leave;
    let isSetup = channelId !== undefined;
    let channel: GuildTextBasedChannel | undefined = undefined;

    if (isSetup) {
        try {
            channel = await member.guild.channels.fetch(channelId!) as GuildTextBasedChannel;
        } catch {
            await channelSync.deleteChannel(joined, !joined, member.guild.id);
            isSetup = false;
        }
    }

    if (isSetup) {
        const embed = new EmbedBuilder()
            .setTitle(joined ? `${member.user.tag} joined!` : `${member.user.tag} left!`)
            .setDescription(`**Invited by**: ${inviter.tag}\n**Account create**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n\n_His invitation is invalid (account too young)!_`)
            .setThumbnail(member.displayAvatarURL())
            .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
            .setColor("Yellow")
        return channel!.send({embeds: [embed]});
    }
}