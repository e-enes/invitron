import { Events, Role } from "discord.js";

import Listener from "../../Listener.js";

class GuildRoleDelete extends Listener {
  public constructor() {
    super(Events.GuildRoleDelete);
  }

  public override async execute(role: Role) {
    const { database } = this.client;

    const data = await database.query("SELECT role_id FROM roles WHERE role_id = ?", [role.id]).catch(() => void 0);

    if (!data || data.length === 0) {
      return;
    }

    await database.query("DELETE FROM roles WHERE role_id = ?", [role.id]).catch(() => void 0);
  }
}

export default GuildRoleDelete;
