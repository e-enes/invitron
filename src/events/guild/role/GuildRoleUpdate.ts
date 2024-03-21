import { Events, Role } from "discord.js";

import Listener from "../../Listener.js";

class GuildRoleUpdate extends Listener {
  public constructor() {
    super(Events.GuildRoleUpdate);
  }

  public override async execute(oldRole: Role, newRole: Role) {
    const { database } = this.client;

    const data = await database.query("SELECT active FROM roles WHERE role_id = ?", [oldRole.id]).catch(() => void 0);

    if (!data || data.length === 0) {
      return;
    }

    const active = data[0].active;

    if (active !== newRole.editable) {
      await database.query("UPDATE roles SET active = ? WHERE role_id = ?", [newRole.editable, oldRole.id]).catch(() => void 0);
    }
  }
}

export default GuildRoleUpdate;
