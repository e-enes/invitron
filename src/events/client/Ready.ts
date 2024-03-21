import { Client, Collection, Events, PresenceStatusData, DataResolver } from "discord.js";
import { Routes } from "discord-api-types/v10";

import Listener from "../Listener.js";
import Logger from "../../utils/Logger.js";
import { CachedInvite } from "../../types/global.js";

class Ready extends Listener {
  public constructor() {
    super(Events.ClientReady, true);
  }

  public override async execute(client: Client<true>) {
    Logger.warn("Login...");

    const { database, config } = client;

    client.user.setPresence({
      status: config.presence.status as PresenceStatusData,
      activities: [
        {
          name: config.presence.activities.name,
          type: config.presence.activities.type,
        },
      ],
    });

    await client.application.commands.set(client.commands.map((command) => command.applicationCommands).flat());

    this.client.guilds.cache.each(async (guild, key) => {
      const data = await database.query("SELECT guild_id FROM guilds WHERE guild_id = ?", [key]);
      if (data.length === 0) {
        await database.query("INSERT INTO guilds (guild_id, language) VALUES (?, ?)", [key, "en"]);
      }

      const cachedInvites = new Collection<string, CachedInvite>();
      const customInvites = await database.query("SELECT member_id AS inviter, link AS code, source FROM links WHERE guild_id = ?", [key]);

      await guild.invites.fetch({ cache: true }).then((invites) => {
        invites.each((invite) => {
          const customInvite = customInvites.find((value: { code: string }) => value.code === invite.code);
          cachedInvites.set(invite.code, {
            member: customInvite?.inviter ?? invite.inviter,
            uses: invite.uses!,
            source: customInvite?.source,
          });
        });
      });

      this.client.invites.set(key, cachedInvites);
    });

    if (!client.user.avatar) {
      const { glob } = await import("glob");
      const [avatar] = await glob("assets/logo.png");
      const [banner] = await glob("assets/banner.png");

      await client.rest.patch(Routes.user(), {
        body: {
          avatar: await DataResolver.resolveImage(avatar),
          banner: await DataResolver.resolveImage(banner),
        },
      });
    }

    Logger.info(`Successfully logged as '${client.user.tag}'.`);
  }
}

export default Ready;
