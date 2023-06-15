import {
    ButtonInteraction,
    CommandInteraction,
    EmbedBuilder
} from "discord.js";
import MyClient from "../types/class/MyClient";
import config from "../../config";

export default async function undefMember(interaction: CommandInteraction | ButtonInteraction, client: MyClient) {
    const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`**${interaction.member}** please **mention** a valid member.`)
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("Red")
    return interaction.editReply({ embeds: [embed] });
}
