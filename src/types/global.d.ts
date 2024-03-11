import { Collection } from "discord.js";

import config from "../config";

import Database from "../database/Database.js";

declare module "discord.js" {
  export interface Client {
    config: typeof config;
    commands: Collection<string, import("../commands/Command").default>;
    components: Collection<string, import("../components/Component").default>;
    database: Database;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN?: string;
      USE_SQLITE?: string;
      MYSQL_HOST?: string;
      MYSQL_PORT?: string;
      MYSQL_USER?: string;
      MYSQL_DATABASE?: string;
      MYSQL_PASSWORD?: string;
      NODE_ENV?: string;
    }
  }
}
