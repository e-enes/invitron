import { EmbedBuilder, GuildMember, User, Snowflake } from "discord.js";

import { isSetup } from "./guild";
import Client from "../../client";
import config from "../../../config";

const isAged = async (
  member: GuildMember,
  inviter: User,
  client: Client,
  joined: boolean
): Promise<void> => {
  const { setup, channel } = await preSetup(joined, member.guild.id, client);

  if (!setup || channel == null) {
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(joined ? `${member} joined!` : `${member} left!`)
    .setDescription(
      `**Invited by**: ${inviter.tag}\n**Account create**: <t:${Math.floor(
        member.user.createdTimestamp / 1000
      )}:R>\n\n_His invitation is invalid (account too young)!_`
    )
    .setThumbnail(member.displayAvatarURL())
    .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
    .setColor("Yellow");
  channel.send({ embeds: [embed] });
};

const isValidInviter = async (
  member: GuildMember,
  client: Client,
  joined: boolean
): Promise<void> => {
  const { setup, channel } = await preSetup(joined, member.guild.id, client);

  if (!setup || channel == null) {
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(joined ? `${member} joined!` : `${member} left!`)
    .setDescription(
      `**Invited by**: Himself\n**Account create**: <t:${Math.floor(
        member.user.createdTimestamp / 1000
      )}:R>\n\n_His invitation is invalid!_`
    )
    .setThumbnail(member.displayAvatarURL())
    .setFooter({ text: config.message.footer, iconURL: client.user!.displayAvatarURL() })
    .setColor("Yellow");
  channel.send({ embeds: [embed] });
};

const preSetup = async (joined: boolean, guildId: Snowflake, client: Client) => {
  const channels = client.getChannels(guildId)!;
  const channelType = joined ? "welcome" : "leave";
  const channelId = channels[channelType];

  return isSetup(channelId, channelType, channels.setup, guildId, client);
};

export { isAged, isValidInviter };
