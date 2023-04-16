import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    GuildMember,
    GuildTextBasedChannel
} from "discord.js";
import MyClient from "../types/class/MyClient";
import config from "../../config";
import channelSync from "../sync/channel";

export default async function antiBot(member: GuildMember, client: MyClient) {
    const channelId = client.cache.channels.get(member.guild.id)?.log;
    let isSetup = channelId !== undefined;
    let channel: GuildTextBasedChannel | undefined = undefined;

    if (isSetup) {
        try {
            channel = await member.guild.channels.fetch(channelId!) as GuildTextBasedChannel;
        } catch {
            await channelSync.deleteChannel(false, false, member.guild.id);
            isSetup = false;
        }
    }

    if (isSetup) {
        const embed = new EmbedBuilder()
            .setTitle("A bot has joined the server!")
            .setDescription(`**Username#Tag**: ${member.user.tag}\n**ID**: ${member.user.id}\n\n**Account create**: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`)
            .setThumbnail(member.displayAvatarURL())
            .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
            .setColor("Red")
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ban-bot-${member.user.id}`)
                    .setLabel(member.bannable ? "Ban this bot" : "This bot isn't bannable")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!member.bannable)
            )
        return channel!.send({embeds: [embed], components: [row]})
    }
}
