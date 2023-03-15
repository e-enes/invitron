import {ButtonInteraction, CommandInteraction, EmbedBuilder} from "discord.js";
import MyClient from "../ts/class/MyClient";

export default async function undefMember(interaction: CommandInteraction | ButtonInteraction, client: MyClient) {
    const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`**${interaction.member!.user.username + "#" + interaction.member!.user.discriminator}** please **mention** a valid member.`)
        .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
        .setColor("DarkRed")
    return interaction.editReply({embeds: [embed]});
}