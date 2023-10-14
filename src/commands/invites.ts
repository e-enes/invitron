import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";

import Client from "../client";
import { InviteStats } from "../types";
import inviteSync from "../utils/invite";
import { undefMember } from "../utils/messages";
import config from "../../config";

export default {
  name: "invites",
  description: "View invitations",
  options: [
    {
      name: "member",
      description: "Mention a server member",
      type: ApplicationCommandOptionType.Mentionable,
      required: false,
    },
  ],
  type: ApplicationCommandType.ChatInput,
  async run(interaction: CommandInteraction, client: Client): Promise<void> {
    const member: GuildMember =
      (interaction.options.get("member")?.member as GuildMember) ||
      (interaction.member as GuildMember);
    if (member === undefined) {
      await undefMember(interaction, client);
      return;
    }

    try {
      const invites: InviteStats = await inviteSync.getInvites(
        member.user.id,
        interaction.guildId!
      );

      const embed = new EmbedBuilder()
        .setTitle("Invitation Stats")
        .setDescription(
          `
                    ${
                      interaction.member!.user.id === member.user.id
                        ? `Congratulations, **${member}**! You have **${invites.invites}** invitations. \n\n_Here's a breakdown of your invitations:_\n\n**${invites.total}** Regular Invitations\n**${invites.leaves}** Left Invitations\n**${invites.bonus}** Bonus Invitations\n**${invites.fake}** Fake Invitations`
                        : `**${member}** has **${invites.invites}** invitations. \n\n_Here's a breakdown of their invitations:_\n\n**${invites.total}** Regular Invitations\n**${invites.leaves}** Left Invitations\n**${invites.bonus}** Bonus Invitations\n**${invites.fake}** Fake Invitations`
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
                        ? `Unable to retrieve your invitations, **${member}**.`
                        : `Unable to retrieve invitations from **${member}** for **${interaction.member}**.`
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
