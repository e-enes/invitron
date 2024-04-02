import { Collection } from "discord.js";

import config from "../config.js";

import MySql from "../database/MySql.js";
import Sqlite from "../database/Sqlite.js";

import ClientUtils from "../utils/ClientUtils.js";
import { CachedInvite } from "./index.js";

declare module "discord.js" {
  export interface Client {
    config: typeof config;
    commands: Collection<string, import("../commands/Command.js").default>;
    components: Collection<string, import("../components/Component.js").default>;
    database: MySql | Sqlite;
    invites: Collection<string, Collection<string, CachedInvite>>;
    utils: ClientUtils;
  }

  export interface EmbedBuilder {
    withDefaultFooter(): this;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN?: string;
      USE_SQLITE?: string;
      MYSQL_HOST?: string;
      MYSQL_PORT?: string;
      MYSQL_USERNAME?: string;
      MYSQL_DATABASE?: string;
      MYSQL_PASSWORD?: string;
      NODE_ENV?: string;
    }
  }
}
