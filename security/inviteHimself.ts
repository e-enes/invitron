import {EmbedBuilder, GuildMember, GuildTextBasedChannel, TextChannel} from "discord.js";
import MyClient from "../ts/class/MyClient";
import config from "../config";
import channelsync from "../utils/channelsync";

export default async function antiBot(member: GuildMember, client: MyClient, joined: boolean) {
    let isSetup = true;
    const channel = await member.guild.channels.fetch(joined ? client.cache.get(member.guild.id)!.welcome! : client.cache.get(member.guild.id)!.leave!).catch(async () => {
        await channelsync.deleteChannel(joined, !joined, member.guild.id);
        isSetup = false
    }) as GuildTextBasedChannel;
    if (isSetup) {
        const embed = new EmbedBuilder()
            .setTitle(joined ? `${member.user.tag} joined!` : `${member.user.tag} left!`)
            .setDescription(`**Invited by**: Himself\n**Account create**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>\n\n_His invitation is invalid!_`)
            .setThumbnail(member.displayAvatarURL())
            .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
            .setColor("Yellow")
        return channel.send({embeds: [embed]});
    }
}
