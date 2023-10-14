import { ButtonInteraction, CommandInteraction, EmbedBuilder, GuildMember, User } from "discord.js";

import Client from "../client";
import config from "../../config";

const noPermission = async (
  interaction: CommandInteraction | ButtonInteraction,
  member: GuildMember,
  client: Client
) => {
  const embed = new EmbedBuilder()
    .setTitle("Error!")
    .setDescription(`**${member}** you **do not have permission** to use this command!`)
    .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
    .setColor("Red");
  return interaction.editReply({ embeds: [embed] });
};

const noDMCommand = (member: User, client: Client) => {
  const embed = new EmbedBuilder()
    .setTitle("Error!")
    .setDescription(`**${member}** direct **message commands** are **not** allowed.`)
    .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
    .setColor("Red");
  return member.send({ embeds: [embed] });
};

const invalidChannel = (interaction: CommandInteraction | ButtonInteraction, client: Client) => {
  const embed = new EmbedBuilder()
    .setTitle("Error!")
    .setDescription(`**${interaction.member}** please choose a **text** channel.`)
    .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
    .setColor("Red");
  return interaction.editReply({ embeds: [embed] });
};

const invalidBonus = (
  interaction: CommandInteraction | ButtonInteraction,
  member: GuildMember,
  client: Client
) => {
  const embed = new EmbedBuilder()
    .setTitle("Error!")
    .setDescription(
      `**${member}** negative numbers, 0 and too large (**+10 digits**) number are not supported.`
    )
    .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
    .setColor("Red");
  return interaction.editReply({ embeds: [embed] });
};

const undefMember = (interaction: CommandInteraction | ButtonInteraction, client: Client) => {
  const embed = new EmbedBuilder()
    .setTitle("Error!")
    .setDescription(`**${interaction.member}** please **mention** a valid member.`)
    .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
    .setColor("Red");
  return interaction.editReply({ embeds: [embed] });
};

export { noPermission, noDMCommand, invalidChannel, invalidBonus, undefMember };
