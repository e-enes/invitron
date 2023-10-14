import { ChannelType, GuildTextBasedChannel, Snowflake, Channel } from "discord.js";

import Client from "../../client";
import channelSync from "../../utils/channel";

const isSetup = async (
  channelId: Snowflake | null,
  channelType: string,
  cacheSetup: boolean,
  guildId: Snowflake,
  client: Client
): Promise<{ setup: boolean; channel: GuildTextBasedChannel | null }> => {
  if (channelId == null) {
    return { setup: false, channel: null };
  }

  if (!cacheSetup) {
    return { setup: false, channel: null };
  }

  let channel: Channel | undefined | null = client.channels.cache.get(channelId);
  if (channel != undefined && channel.type == ChannelType.GuildText) {
    return { setup: true, channel: channel as GuildTextBasedChannel };
  }

  channel = await client.channels.fetch(channelId);
  if (channel != undefined && channel.type == ChannelType.GuildText) {
    return { setup: true, channel: channel as GuildTextBasedChannel };
  }

  await channelSync.del(channelType, guildId);
  return { setup: false, channel: null };
};

export { isSetup };
