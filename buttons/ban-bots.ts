import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    GuildMember,
    PermissionsBitField,
    Snowflake
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";
import noPermission from "../lib/utils/noPermission";
import config from "../config";

export async function run(interaction: ButtonInteraction, client: MyClient) {
    const member: GuildMember = interaction.member as GuildMember;
    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return noPermission(interaction, member, client);

    const user: Snowflake = interaction.customId.split("-")[2];
    try {
        await interaction.guild?.members.ban(user, { reason: "Unwanted Bot" });
        const embed = new EmbedBuilder()
            .setTitle("Success!")
            .setDescription(`**${member}** banned the bot **${await client.users.fetch(user)}**.`)
            .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
            .setColor("DarkGreen")
        await interaction.reply({ embeds: [embed] });
        return interaction.fetchReply().then((m) => {
            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ban-bot-${user}`)
                        .setLabel("Banned")
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true)
                )
            return m.edit({ components: [row] });
        });
    } catch {
        const embed = new EmbedBuilder()
            .setTitle("Error!")
            .setDescription(`**${member}** unable to ban the bot **${await client.users.fetch(user)}**.`)
            .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
            .setColor("Red")
        await interaction.editReply({ embeds: [embed] });
        return interaction.fetchReply().then((m) => {
            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ban-bot-${user}`)
                        .setLabel("This bot isn't bannable")
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                )
            return m.edit({ components: [row] });
        });
    }
}
