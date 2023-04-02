import {
    EmbedBuilder, User
} from "discord.js";
import MyClient from "../ts/class/MyClient";
import config from "../config";

export default async function noDMCommand(member: User, client: MyClient) {
    const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`**${member.tag}** direct **message commands** are **not** allowed.`)
        .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
        .setColor("Red")
    return member.send({embeds: [embed]});
}
