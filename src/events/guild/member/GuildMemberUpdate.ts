import { Events, GuildMember } from "discord.js";

import Listener from "../../Listener.js";

class GuildMemberUpdate extends Listener {
  public constructor() {
    super(Events.GuildMemberUpdate);
  }

  public override async execute(oldMember: GuildMember, newMember: GuildMember) {
    const { database } = this.client;

    const roles = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id));

    if (roles.size < 0) {
      return;
    }

    const data = await database.query("SELECT role_id AS role FROM fakes WHERE guild_id = ?", [oldMember.guild.id]);

    if (data.length === 0 || !data?.[0].role) {
      return;
    }

    const role = roles.get(data[0].role);

    if (!role) {
      return;
    }

    await database
      .query("SELECT inviter_id AS inviter, code FROM invites WHERE guild_id = ? AND member_id = ? AND fake = true", [
        oldMember.guild.id,
        oldMember.user.id,
      ])
      .then((data) => {
        if (data.length === 0 || !data?.[0].inviter || !data?.[0].code) {
          return;
        }

        database.query("UPDATE invites SET fake = false WHERE guild_id = ? AND member_id = ? AND fake = true", [
          oldMember.guild.id,
          oldMember.user.id,
        ]);
      });
  }
}

export default GuildMemberUpdate;
