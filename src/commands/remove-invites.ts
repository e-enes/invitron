import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionsBitField,
} from "discord.js";

import Client from "../client";
import { InviteStats } from "../types";
import inviteSync from "../utils/invite";
import { noPermission, undefMember, invalidBonus } from "../utils/messages";
import config from "../../config";

export default {
  name: "remove-invites",
  description: "Remove invitations from a member",
  options: [
    {
      name: "member",
      description: "Mention a server member",
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: "number",
      description: "Number of invitations to remove",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  type: ApplicationCommandType.ChatInput,
  async run(interaction: CommandInteraction, client: Client): Promise<void> {
    const user: GuildMember = interaction.member as GuildMember;
    if (!user.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      await noPermission(interaction, user, client);
      return;
    }

    const member: GuildMember = interaction.options.get("member")?.member as GuildMember;
    if (member === undefined) {
      await undefMember(interaction, client);
      return;
    }

    const bonus = interaction.options.get("number")?.value as number;
    if (bonus <= 0 || bonus >= 2147483647) {
      await invalidBonus(interaction, user, client);
      return;
    }

    try {
      const invites: InviteStats = await inviteSync.getInvites(
        member.user.id,
        interaction.guildId!
      );
      if (Math.abs(invites.bonus - bonus) >= 2147483647) {
        const embed = new EmbedBuilder()
          .setTitle("Error!")
          .setDescription(
            `**${user}** was unable to add invitations.\n\nThe total number of invitations has exceeded the maximum limit.`
          )
          .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
          .setColor("Red");
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      await inviteSync.bonus(member.user.id, interaction.guildId!, -1 * Math.abs(bonus));
      const embed = new EmbedBuilder()
        .setTitle("Remove Invitation")
        .setDescription(
          `
                    ${
                      user.user.id === member.user.id
                        ? `**${member}** you've lost **${bonus}** invitations.`
                        : `**${user}** has removed **${bonus}** invitations from **${member}**`
                    }
                `
        )
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("DarkGreen");
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(`**${user}** was unable **to remove invitations**.`)
        .setThumbnail(member.displayAvatarURL())
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("Red");
      if (config.handleError) {
        embed.addFields({ name: "Console", value: (error as Error).message });
      }
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
