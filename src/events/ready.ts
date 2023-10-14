import { Events, Snowflake } from "discord.js";

import Client from "../client";
import { CacheGuild, CacheInvite } from "../types";
import { register } from "../utils/slash";
import channelSync from "../utils/channel";
import linkSync from "../utils/link";
import { initDatabase } from "../utils/mysql";
import config from "../../config";

export default {
  once: true,
  name: Events.ClientReady,
  async execute(client: Client): Promise<void> {
    await register(
      client,
      client.getRegisters().map(command => ({
        name: command.name,
        description: command.description,
        options: command.options ?? undefined,
        type: command.type,
      }))
    );

    initDatabase();

    client.user!.setActivity({ name: config.activity.name, type: config.activity.type });

    for (let i = 0; i < client.guilds.cache.size; i++) {
      const guild = client.guilds.cache.at(i)!;
      const guildId = guild.id;

      const channels = await channelSync.get(guildId);

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

      client.setGuild(guildId, cacheGuild);

      console.log("Connected!");
      console.log(client.getGuild(guildId));
    }
  },
};
