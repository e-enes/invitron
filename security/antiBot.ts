import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    GuildMember,
    GuildTextBasedChannel
} from "discord.js";
import MyClient from "../ts/class/MyClient";
import config from "../config";
import channelsync from "../utils/channelsync";

export default async function antiBot(member: GuildMember, client: MyClient) {
    let isSetup = true;
    const channel = await member.guild.channels.fetch(client.cache.get(member.guild.id)!.log!).catch(async () => {
        await channelsync.deleteChannel(false, false, member.guild.id);
        isSetup = false
    }) as GuildTextBasedChannel;

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
        return channel.send({embeds: [embed], components: [row]})
    }
}
