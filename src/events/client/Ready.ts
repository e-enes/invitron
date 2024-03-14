import { Client, Events, PresenceStatusData } from "discord.js";

import Listener from "../Listener.js";
import Logger from "../../utils/Logger.js";

class Ready extends Listener {
  public constructor() {
    super(Events.ClientReady, true);
  }

  public override async execute(client: Client<true>) {
    Logger.info(`Successfully logged as '${client.user.tag}'.`);

    const { presence } = client.config;
    client.user.setPresence({
      status: presence.status as PresenceStatusData,
      activities: [
        {
          name: presence.activities.name,
          type: presence.activities.type,
        },
      ],
    });

    await client.application.commands.set(client.commands.map((command) => command.applicationCommands).flat());
  }
}

export default Ready;
