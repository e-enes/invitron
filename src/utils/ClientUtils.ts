import { Client, Collection, Guild } from "discord.js";

import { CachedInvite } from "../types/index.js";

class ClientUtils {
  public constructor(private client: Client) {}

  public async overwriteCache(guild: Guild) {
    const { database, invites } = this.client;

    const data = await database.query("SELECT guild_id FROM guilds WHERE guild_id = ?", [guild.id]).catch(() => void 0);
    if (!data || data.length === 0) {
      await database.query("INSERT INTO guilds (guild_id, language) VALUES (?, ?)", [guild.id, "en"]);
    }

    const cachedInvites = new Collection<string, CachedInvite>();
    const customInvites = await database
      .query("SELECT member_id AS inviter, link AS code, source FROM links WHERE guild_id = ?", [guild.id])
      .catch(() => void 0);

    await guild.invites.fetch({ cache: true }).then((invites) => {
      invites.each((invite) => {
        const customInvite = customInvites?.find((value: { code: string }) => value.code === invite.code);
        cachedInvites.set(invite.code, {
          member: customInvite?.inviter ?? invite.inviter!.id,
          uses: invite.uses!,
          source: customInvite?.source,
        });
      });
    });

    if (guild.vanityURLCode) {
      cachedInvites.set(guild.vanityURLCode, {
        member: guild.id,
        uses: guild.vanityURLUses ?? 0,
      });
    }

    invites.set(guild.id, cachedInvites);
  }
}

export default ClientUtils;
