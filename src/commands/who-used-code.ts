import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";

import Client from "../client";
import inviteSync from "../utils/invite";
import config from "../../config";

export default {
  name: "who-used-code",
  description: "See which users have used this code",
  options: [
    {
      name: "code",
      description: "Code (without discord.gg/)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  type: ApplicationCommandType.ChatInput,
  async run(interaction: CommandInteraction, client: Client): Promise<void> {
    const code = interaction.options.get("code")!.value as string;
    const isInvite = await interaction
      .guild!.invites.fetch(code)
      .then(() => true)
      .catch(() => false);

    if (!isInvite) {
      const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(
          `**${interaction.member}** the invitation **code** is invalid/has **expired**.`
        )
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("Red");
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const invite = client.getInvite(interaction.guild!.id, code)!;

    try {
      const members = await inviteSync.getWhoUsed(code, interaction.guild!.id);

      if (Object.keys(members).length <= 0) {
        const embed = new EmbedBuilder()
          .setTitle("Error!")
          .setDescription(`**${interaction.member}** no one **used** this invitation code.`)
          .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
          .setColor("Red");
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const orderedMembers = await Promise.all(
        Object.entries(members).map(async ([key, value]) => {
          return await client.users
            .fetch(key)
            .then(u => {
              if (value) {
                return `${u.username} (fake)`;
              } else {
                return `${u.username}`;
              }
            })
            .catch(() => undefined);
        })
      );

      const embed = new EmbedBuilder()
        .setTitle("Success!")
        .setDescription(
          `Code: **${code}**\nAuthor: **${await client.users.fetch(
            invite.memberId
          )}**\n\nMembers who joined with this invite:\n\`\`\` ${orderedMembers.join(", ")} \`\`\``
        )
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("DarkGreen");
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`${interaction.member} unable to **recover** members.`)
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("Red");
      if (config.handleError) {
        embed.addFields({ name: "Console", value: (error as Error).message });
      }
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
