import { Collection, Events, Guild } from "discord.js";

import Listener from "../Listener.js";
import { CachedInvite } from "../../types/global.js";

class GuildAvailable extends Listener {
  public constructor() {
    super(Events.GuildAvailable);
  }

  public override async execute(guild: Guild) {
    const { database } = this.client;

    const data = await database.query("SELECT guild_id FROM guilds WHERE guild_id = ?", [guild.id]);
    if (data.length === 0) {
      await database.query("INSERT INTO guilds (guild_id, language) VALUES (?, ?)", [guild.id, "en"]);
    }

    const cachedInvites = new Collection<string, CachedInvite>();
    await guild.invites.fetch({ cache: true }).then((invites) => {
      invites.each((invite) => {
        cachedInvites.set(invite.code, { member: invite.inviter!.id, uses: invite.uses! });
      });
    });

    this.client.invites.set(guild.id, cachedInvites);
  }
}

export default GuildAvailable;
