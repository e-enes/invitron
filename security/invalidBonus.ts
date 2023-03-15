import {ButtonInteraction, CommandInteraction, EmbedBuilder, GuildMember} from "discord.js";
import MyClient from "../ts/class/MyClient";

export default async function invalidBonus(interaction: CommandInteraction | ButtonInteraction, member: GuildMember, client: MyClient) {
    const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`**${member.user.tag}** negative numbers, 0 and too large (**+10 digits**) number are not supported.`)
        .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
        .setColor("DarkRed")
    return interaction.editReply({embeds: [embed]});
}