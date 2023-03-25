import {
    EmbedBuilder, User
} from "discord.js";
import MyClient from "../ts/class/MyClient";

export default async function noDMCommand(member: User, client: MyClient) {
    const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`**${member.tag}** direct **message commands** are **not** allowed.`)
        .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
        .setColor("DarkRed")
    return member.send({embeds: [embed]});
}
