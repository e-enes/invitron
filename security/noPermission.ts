import {ButtonInteraction, CommandInteraction, EmbedBuilder, GuildMember} from "discord.js";
import MyClient from "../ts/class/MyClient";

export default async function noPermission(interaction: CommandInteraction | ButtonInteraction, member: GuildMember, client: MyClient) {
    const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`**${member.user.tag}** you **do not have permission** to use this command!`)
        .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
        .setColor("DarkRed")
    return interaction.editReply({embeds: [embed]});
}