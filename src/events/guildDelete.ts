import { Events, Guild } from "discord.js";

import Client from "../client";

export default {
  once: false,
  name: Events.GuildDelete,
  async execute(guild: Guild, client: Client): Promise<void> {
    client.deleteGuild(guild.id);
  },
};
