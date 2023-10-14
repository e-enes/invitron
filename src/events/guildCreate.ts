import { Events, Guild, Snowflake } from "discord.js";

import Client from "../client";
import { CacheGuild, CacheInvite } from "../types";
import channelSync from "../utils/channel";
import linkSync from "../utils/link";

export default {
  once: false,
  name: Events.GuildCreate,
  async execute(guild: Guild, client: Client): Promise<void> {
    await channelSync.add(guild.id);
    const channels = await channelSync.get(guild.id);

    const cacheGuild: CacheGuild = {
      invites: new Map<string, CacheInvite>(),
      links: new Map<string, Snowflake>(),
      channels: {
        setup: channels.setup,
        welcome: channels.welcome,
        leave: channels.leave,
        log: channels.log,
      },
    };

    const guildInvites = await guild.invites.fetch();
    const links = await linkSync.get(guild.id);

    for (const [code, memberId] of Object.entries(links)) {
      cacheGuild.links.set(code, memberId as string);
    }

    const linksMap = cacheGuild.links;

    guildInvites.each(inv => {
      const invCode = inv.code;
      const invUses = inv.uses!;
      const inviterId = linksMap.has(invCode) ? linksMap.get(invCode)! : inv.inviter!.id;

      cacheGuild.invites.set(invCode, { uses: invUses, memberId: inviterId });
    });

    client.setGuild(guild.id, cacheGuild);
  },
};
