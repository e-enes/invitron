import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember, TextChannel} from "discord.js";
import MyClient from "../ts/class/MyClient";

export default async function antiBot(member: GuildMember, client: MyClient) {
    const embed = new EmbedBuilder()
        .setTitle("A bot has joined the server!")
        .setDescription(
            `
            **Username#Tag**: ${member.user.tag}\n
            **Account create**: <t:${Math.floor(member.user.createdTimestamp) / 1000}:R>\n
            **ID**: ${member.user.id}
            `
        )
        .setThumbnail(member.displayAvatarURL())
        .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
        .setColor("DarkRed")
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`ban-bot-${member.user.id}`)
                .setLabel(member.bannable ? "Ban this bot" : "This bot isn't bannable")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(!member.bannable)
        )
    const channel = await client.channels.fetch(process.env.CHANNEL_LOG!) as TextChannel;
    return channel.send({embeds: [embed], components: [row]});
}
