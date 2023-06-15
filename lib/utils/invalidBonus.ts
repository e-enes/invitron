import {
    ButtonInteraction,
    CommandInteraction,
    EmbedBuilder,
    GuildMember
} from "discord.js";
import MyClient from "../types/class/MyClient";
import config from "../../config";

export default async function invalidBonus(interaction: CommandInteraction | ButtonInteraction, member: GuildMember, client: MyClient) {
    const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`**${member}** negative numbers, 0 and too large (**+10 digits**) number are not supported.`)
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("Red")
    return interaction.editReply({ embeds: [embed] });
}
