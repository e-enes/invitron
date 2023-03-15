import {CommandInteraction, EmbedBuilder, Snowflake} from "discord.js";
import MyClient from "../ts/class/MyClient";
import invitesync from "../utils/invitesync";

export default {
    name: "leaderboard",
    description: "View leaderboard",
    async run(interaction: CommandInteraction, client: MyClient) {
        await interaction.deferReply();

        try {
            const leaderboard: { [key: Snowflake]: number } = await invitesync.leaderboard(interaction.commandGuildId!);

            if (Object.keys(leaderboard).length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle("Success!")
                    .setDescription(`**${interaction.member!.user.username + "#" + interaction.member!.user.discriminator}** there are currently **no users with invitations** on this server.`)
                    .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
                    .setColor("DarkGreen")
                return interaction.editReply({embeds: [embed]});
            }

            const orderedLeaderboard = await Promise.all(Object.entries(leaderboard)
                .sort((a, b) => {
                    if (a[1] < 0 && b[1] < 0) {
                        return a[1] - b[1];
                    } else if (a[1] >= 0 && b[1] >= 0) {
                        return a[1] - b[1];
                    } else {
                        return a[1] < 0 ? 1 : -1;
                    }
                })
                .map(async ([key, value], i) => {
                    const user = await client.users.fetch(key);

                    return `**${i + 1}) ${user.tag}** has **${value}** invitations`;
                }));

            const embed = new EmbedBuilder()
                .setTitle("Invitation Leaderboard")
                .setDescription(`Guild **${interaction.guild!.name}**\n\n${orderedLeaderboard.join("\n")}`)
                .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
                .setColor("DarkGreen")
            return interaction.editReply({embeds: [embed]});
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle("Error!")
                .setDescription(
                    `
                    **${interaction.member!.user.username + "#" + interaction.member!.user.discriminator}** unable to **retrieve** the leaderboard.
                    \n\n**Console**: ${error}
                    `
                )
                .setFooter({text: "Powered by Sene", iconURL: client.user!.displayAvatarURL()})
                .setColor("DarkRed")
            return interaction.editReply({embeds: [embed]});
        }
    }
}