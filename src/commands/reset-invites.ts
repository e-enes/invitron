import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionsBitField,
} from "discord.js";

import Client from "../client";
import inviteSync from "../utils/invite";
import { noPermission, undefMember } from "../utils/messages";
import config from "../../config";

export default {
  name: "reset-invites",
  description: "Reset a member's invites to 0",
  options: [
    {
      name: "member",
      description: "Mention a server member",
      type: ApplicationCommandOptionType.Mentionable,
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

    try {
      await inviteSync.clear(member.user.id, interaction.guildId!);

      const embed = new EmbedBuilder()
        .setTitle("Invitation Reset")
        .setDescription(
          `
                    ${
                      user.user.id === member.user.id
                        ? `**${user}** your invitations have been **reset**`
                        : `**${user}** has reset **${member}**'s invitations.`
                    }
                `
        )
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("DarkGreen");
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(
          `
                    ${
                      interaction.member!.user.id === member.user.id
                        ? `**${user}** unable to **reset** your invitations.`
                        : `**${user}** was unable to **reset** **${member}**'s invitations.`
                    }
                `
        )
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("Red");
      if (config.handleError) {
        embed.addFields({ name: "Console", value: (error as Error).message });
      }
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
