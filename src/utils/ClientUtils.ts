import { Client, Collection, Guild } from "discord.js";
import { CachedInvite } from "../types/global";

class ClientUtils {
  public constructor(private client: Client) {}

  public async overwriteCache(guild: Guild) {
    const { database, invites } = this.client;

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

    invites.set(guild.id, cachedInvites);
  }
}

export default ClientUtils;
