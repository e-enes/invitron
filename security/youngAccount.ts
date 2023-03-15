import {EmbedBuilder, GuildMember, TextChannel, User} from "discord.js";
import MyClient from "../ts/class/MyClient";

export default async function antiBot(member: GuildMember, inviter: User, client: MyClient, joined: boolean) {
    const embed = new EmbedBuilder()
        .setTitle(joined ? `${member.user.tag} joined!` : `${member.user.tag} left!`)
        .setDescription(
            `
            **Invited by**: ${inviter.tag}\n
            **Account create**: <t:${Math.floor(member.user.createdTimestamp) / 1000}:R>\n\n
            _His invitation is invalid (account too young)!_
            `
        )
        .setThumbnail(member.displayAvatarURL())
        .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
        .setColor("Yellow")
    const channel = await client.channels.fetch(joined ? process.env.CHANNEL_JOIN! : process.env.CHANNEL_LEAVE!) as TextChannel;
    return channel.send({embeds: [embed]});
}