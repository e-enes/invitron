import {
    ButtonInteraction,
    CommandInteraction,
    EmbedBuilder,
    GuildMember
} from "discord.js";
import MyClient from "../types/class/MyClient";
import config from "../../config";

export default async function noPermission(interaction: CommandInteraction | ButtonInteraction, member: GuildMember, client: MyClient) {
    const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`**${member}** you **do not have permission** to use this command!`)
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("Red")
    return interaction.editReply({ embeds: [embed] });
}
