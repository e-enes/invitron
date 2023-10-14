import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
} from "discord.js";

import { isSetup } from "./guild";
import Client from "../../client";
import config from "../../../config";

const isBot = async (member: GuildMember, client: Client): Promise<void> => {
  const channels = client.getChannels(member.guild.id)!;
  const { setup, channel } = await isSetup(
    channels.log,
    "log",
    channels.setup,
    member.guild.id,
    client
  );

  if (!setup || channel == null) {
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("A bot has joined the server!")
    .setDescription(
      `**Username**: ${member}\n**ID**: ${member.user.id}\n\n**Account create**: <t:${Math.floor(
        member.user.createdTimestamp / 1000
      )}:R>`
    )
    .setThumbnail(member.displayAvatarURL())
    .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
    .setColor("Red");
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`ban-bot-${member.user.id}`)
      .setLabel(member.bannable ? "Ban this bot" : "This bot isn't bannable")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!member.bannable)
  );

  channel.send({ embeds: [embed], components: [row] });
};

export { isBot };
