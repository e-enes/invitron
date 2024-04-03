import { Events, Guild } from "discord.js";

import Listener from "../Listener.js";

class GuildDelete extends Listener {
  public constructor() {
    super(Events.GuildDelete);
  }

  public override async execute(guild: Guild) {
    const { database } = this.client;

    const data = await database.query("SELECT 1 FROM guilds WHERE guild_id = ?", [guild.id]);
    if (data.length !== 0) {
      await database.query("DELETE FROM guilds WHERE guild_id = ?", [guild.id]);
    }

    this.client.invites.delete(guild.id);
  }
}

export default GuildDelete;
