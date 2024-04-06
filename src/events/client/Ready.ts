import { Client, Events, PresenceStatusData, DataResolver } from "discord.js";
import { Routes } from "discord-api-types/v10";

import Listener from "../Listener.js";
import Logger from "../../utils/Logger.js";

class Ready extends Listener {
  public constructor() {
    super(Events.ClientReady, true);
  }

  public override async execute(client: Client<true>) {
    Logger.warn("Login...");

    const { config } = client;

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

    this.client.guilds.cache.each(async (guild) => {
      await this.client.utils.overwriteCache(guild);
    });

    if (!client.user.avatar) {
      const { glob } = await import("glob");
      const [avatar] = await glob("assets/pp/avatar.png");
      const [banner] = await glob("assets/pp/banner.png");

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
