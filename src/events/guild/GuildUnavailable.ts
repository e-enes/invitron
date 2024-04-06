import { Events, Guild } from "discord.js";

import Listener from "../Listener.js";

class GuildUnavailable extends Listener {
  public constructor() {
    super(Events.GuildUnavailable);
  }

  public override async execute(guild: Guild) {
    this.client.invites.delete(guild.id);
  }
}

export default GuildUnavailable;
