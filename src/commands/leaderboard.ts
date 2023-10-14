import { ApplicationCommandType, CommandInteraction, EmbedBuilder } from "discord.js";

import Client from "../client";
import { LeaderboardStats } from "../types";
import inviteSync from "../utils/invite";
import config from "../../config";

export default {
  name: "leaderboard",
  description: "View leaderboard",
  type: ApplicationCommandType.ChatInput,
  async run(interaction: CommandInteraction, client: Client): Promise<void> {
    try {
      const leaderboard: LeaderboardStats = await inviteSync.leaderboard(interaction.guildId!);

      if (Object.keys(leaderboard).length <= 0) {
        const embed = new EmbedBuilder()
          .setTitle("Success!")
          .setDescription(
            `**${interaction.member}** there are currently **no users with invitations** on this server.`
          )
          .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
          .setColor("DarkGreen");
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const orderedLeaderboard = await Promise.all(
        Object.entries(leaderboard)
          .sort((a, b) => b[1] - a[1])
          .map(async ([key, value], i) => {
            const user = await client.users.fetch(key).catch(() => undefined);

            return `**${i + 1}) ${user}** has **${value}** invitations`;
          })
      );

      const top5 = orderedLeaderboard.slice(0, 5);

      const embed = new EmbedBuilder()
        .setTitle("Invitation Leaderboard")
        .setDescription(`Guild: **${interaction.guild!.name}**\n\n${top5.join("\n")}`)
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("DarkGreen");
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`**${interaction.member}** unable to **retrieve** the leaderboard.`)
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("Red");
      if (config.handleError) {
        embed.addFields({ name: "Console", value: (error as Error).message });
      }
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
