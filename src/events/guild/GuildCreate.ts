import { Events, Guild } from "discord.js";

import Listener from "../Listener.js";

class GuildCreate extends Listener {
  public constructor() {
    super(Events.GuildCreate);
  }

  public override async execute(guild: Guild) {
    const { database } = this.client;

    const data = await database.query("SELECT guild_id FROM guilds WHERE guild_id = ?", [guild.id]);
    if (data.length === 0) {
      await database.query("INSERT INTO guilds (guild_id, language) VALUES (?, ?)", [guild.id, "en"]);
    }
  }
}

export default GuildCreate;
