import {
    ActionRowBuilder,
    ApplicationCommandType,
    ButtonBuilder,
    CommandInteraction,
    EmbedBuilder,
    Snowflake
} from "discord.js";
import MyClient from "../ts/class/MyClient";
import invitesync from "../utils/invitesync";
import config from "../config";

export default {
    name: "leaderboard",
    description: "View leaderboard",
    type: ApplicationCommandType.ChatInput,
    async run(interaction: CommandInteraction, client: MyClient) {
        try {
            const leaderboard: { [key: Snowflake]: number } = await invitesync.leaderboard(interaction.guildId!);

            if (Object.keys(leaderboard).length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle("Success!")
                    .setDescription(`**${interaction.member!.user.username + "#" + interaction.member!.user.discriminator}** there are currently **no users with invitations** on this server.`)
                    .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                    .setColor("DarkGreen")
                return interaction.editReply({embeds: [embed]});
            }

            const orderedLeaderboard = await Promise.all(Object.entries(leaderboard)
                .sort((a, b) => b[1] - a[1])
                .map(async ([key, value], i) => {
                    const user = await client.users.fetch(key).catch(() => undefined);

                    return `**${i + 1}) ${user?.tag}** has **${value}** invitations`;
                }))

            const top5 = orderedLeaderboard.slice(0, 5);

            const embed = new EmbedBuilder()
                .setTitle("Invitation Leaderboard")
                .setDescription(`Guild: **${interaction.guild!.name}**\n\n${top5.join("\n")}`)
                .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                .setColor("DarkGreen")
            return interaction.editReply({embeds: [embed]});
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle("Error!")
                .setDescription(`**${interaction.member!.user.username + "#" + interaction.member!.user.discriminator}** unable to **retrieve** the leaderboard.`)
                .setFooter({text: config.message.footer, iconURL: client.user!.displayAvatarURL()})
                .setColor("Red")
            config.handleError ?
                embed.addFields({name: "Console", value: error as string}) :
                console.error(error);
            return interaction.editReply({embeds: [embed]});
        }
    }
}
