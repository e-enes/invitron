import { Client, Collection, Guild, GuildMember } from "discord.js";

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

  public async updateRole(guildId: string, inviter: GuildMember, invites: number = -1) {
    const { database } = this.client;

    const data = await database
      .query(
        "SELECT R.role_id AS role, R.number_invitations AS requiredInvitations, RC.keep_role AS keepRole, RC.stacked_role AS stackedRole FROM roles R LEFT JOIN roles_configuration RC ON R.guild_id = RC.guild_id WHERE R.guild_id = ? AND R.active = true GROUP BY R.role_id",
        [guildId]
      )
      .catch(() => void 0);

    if (!data || data.length === 0) {
      return;
    }

    if (invites === -1) {
      const preInvites = (
        await database
          .query(
            "SELECT COALESCE(SUM(CASE WHEN I.inactive = 0 AND I.fake = 0 THEN 1 ELSE 0 END), 0) AS valid, COALESCE((SELECT SUM(B.bonus) FROM bonus B WHERE B.guild_id = ? AND B.inviter_id = ?), 0) AS bonus FROM invites I WHERE I.guild_id = ? AND I.inviter_id = ?",
            [guildId, inviter.id, guildId, inviter.id]
          )
          .catch(() => void 0)
      )?.[0];

      invites = preInvites?.valid + preInvites?.bonus;
    }

    const { keepRole, stackedRole } = data[0];
    const currentRoles = inviter.roles.cache;

    let rolesToAdd: string[] = [];
    let rolesToRemove: string[] = [];

    for (const { role, requiredInvitations } of data) {
      const hasRole = currentRoles.has(role);
      const meetsRequirement = invites >= requiredInvitations;

      if (meetsRequirement && !hasRole) {
        console.log("add", role, invites, requiredInvitations);
        rolesToAdd.push(role);
      } else if (!meetsRequirement && hasRole && !keepRole) {
        console.log("remove", role, invites, requiredInvitations);
        rolesToRemove.push(role);
      }
    }

    if (!stackedRole) {
      const highestRequiredInvitations = Math.max(...rolesToAdd.map((role) => data.find((r) => r.role === role).requiredInvitations));
      rolesToAdd = rolesToAdd.filter((role) => data.find((r) => r.role === role).requiredInvitations === highestRequiredInvitations);

      rolesToRemove = rolesToRemove.concat(
        currentRoles
          .filter((roleCache) => {
            const roleData = data.find((r) => r.role === roleCache.id);
            return roleData && roleData.requiredInvitations < highestRequiredInvitations;
          })
          .map((roleCache) => roleCache.id)
      );
    }

    rolesToRemove = rolesToRemove.filter((role) => !rolesToAdd.includes(role));

    await Promise.allSettled([
      ...rolesToAdd.map((role) => inviter.roles.add(role)),
      ...rolesToRemove.map((role) => inviter.roles.remove(role)),
    ]);
  }
}

export default ClientUtils;
