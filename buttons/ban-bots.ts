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
import MyClient from "../ts/class/MyClient";
import noPermission from "../security/noPermission";

export async function run(interaction: ButtonInteraction, client: MyClient) {
    await interaction.deferReply();
    const member: GuildMember = interaction.member as GuildMember;
    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return noPermission(interaction, member, client);

    const user: Snowflake = interaction.customId.split("-")[2];
    try {
        await interaction.guild?.members.ban(user, {reason: "Unwanted Bot"});
        const embed = new EmbedBuilder()
            .setTitle("Success!")
            .setDescription(`**${member.user.tag}** banned the bot **${client.users.fetch(user).then((u) => u.tag)}**.`)
            .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
            .setColor("DarkGreen")
        await interaction.reply({embeds: [embed]});
        return interaction.fetchReply().then((m) => {
            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ban-bot-${user}`)
                        .setLabel("Banned")
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true)
                )
            return m.edit({components: [row]});
        });
    } catch {
        const embed = new EmbedBuilder()
            .setTitle("Error!")
            .setDescription(`**${member.user.tag}** unable to ban the bot **${client.users.fetch(user).then((u) => u.tag)}**.`)
            .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
            .setColor("DarkRed")
        await interaction.editReply({embeds: [embed]});
        return interaction.fetchReply().then((m) => {
            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ban-bot-${user}`)
                        .setLabel("This bot isn't bannable")
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                )
            return m.edit({components: [row]});
        });
    }
}
