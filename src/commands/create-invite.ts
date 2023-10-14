import { ApplicationCommandType, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";

import Client from "../client";
import linkSync from "../utils/link";
import config from "../../config";

export default {
  name: "create-invite",
  description: "Create an invitation link that never expires",
  type: ApplicationCommandType.ChatInput,
  async run(interaction: CommandInteraction, client: Client): Promise<void> {
    const member: GuildMember = interaction.member as GuildMember;
    const link = client.getLink(interaction.guild!.id, member.id);
    console.log(link);

    if (link != undefined) {
      const embed = new EmbedBuilder()
        .setTitle("Error!")
        .setDescription(
          `**${member.user.username}** you already **have** an invitation link (*${link}*)`
        )
        .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
        .setColor("Red");
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    interaction.guild?.invites
      .create(interaction.channel!.id, {
        maxAge: 0,
        temporary: false,
        unique: true,
      })
      .then(inv => {
        client.getInvites(interaction.guild!.id)!.set(inv.code, {
          uses: inv.uses!,
          memberId: member.user.id,
        });

        try {
          linkSync.add(member.user.id, interaction.guild!.id, inv.code);
        } catch (error) {
          inv.delete("Unsaved invitation");

          const embed = new EmbedBuilder()
            .setTitle("Error!")
            .setDescription(`${member} unable to **save** invitation code.`)
            .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
            .setColor("Red");
          if (config.handleError) {
            embed.addFields({ name: "Console", value: (error as Error).message });
          }
          interaction.editReply({ embeds: [embed] });
          return;
        }

        client.setLink(interaction.guild!.id, inv.code, member.id);

        const embed = new EmbedBuilder()
          .setTitle("Success!")
          .setDescription(
            `**${member.user.username}** your invitation **link** for this server is *${inv.code}*`
          )
          .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
          .setColor("DarkGreen");
        interaction.editReply({ embeds: [embed] });
      });
  },
};
