import { Events, Guild } from "discord.js";

import Listener from "../Listener.js";

class GuildAvailable extends Listener {
  public constructor() {
    super(Events.GuildAvailable);
  }

  public override async execute(guild: Guild) {
    await this.client.utils.overwriteCache(guild);
  }
}

export default GuildAvailable;
