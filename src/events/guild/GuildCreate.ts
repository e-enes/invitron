import { Events, Guild } from "discord.js";

import Listener from "../Listener.js";

class GuildCreate extends Listener {
  public constructor() {
    super(Events.GuildCreate);
  }

  public override async execute(guild: Guild) {
    await this.client.utils.overwriteCache(guild);
  }
}

export default GuildCreate;
