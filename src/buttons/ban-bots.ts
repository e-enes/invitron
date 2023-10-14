import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
  PermissionsBitField,
  Snowflake,
} from "discord.js";

import Client from "../client";
import { noPermission } from "../utils/messages";
import config from "../../config";

const run = async (interaction: ButtonInteraction, client: Client): Promise<void> => {
  const member: GuildMember = interaction.member as GuildMember;
  if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
    await noPermission(interaction, member, client);
    return;
  }

  const user: Snowflake = interaction.customId.split("-")[2];
  try {
    await interaction.guild?.members.ban(user, { reason: "Unwanted Bot" });
    const embed = new EmbedBuilder()
      .setTitle("Success!")
      .setDescription(`**${member}** banned the bot **${await client.users.fetch(user)}**.`)
      .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
      .setColor("DarkGreen");
    await interaction.reply({ embeds: [embed] });
    await interaction.fetchReply().then(m => {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btnBuilder(user, "Banned"));
      return m.edit({ components: [row] });
    });
  } catch {
    const embed = new EmbedBuilder()
      .setTitle("Error!")
      .setDescription(`**${member}** unable to ban the bot **${await client.users.fetch(user)}**.`)
      .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
      .setColor("Red");
    await interaction.editReply({ embeds: [embed] });
    await interaction.fetchReply().then(m => {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        btnBuilder(user, "Unable to ban")
      );
      m.edit({ components: [row] });
    });
  }
};

const btnBuilder = (user: string, label: string): ButtonBuilder => {
  return new ButtonBuilder()
    .setCustomId(`ban-bot-${user}`)
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setDisabled(true);
};

export default run;
