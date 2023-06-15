import { Snowflake } from "discord.js";

export interface ChannelResults {
    id: number;
    setup: number;
    guild: Snowflake;
    welcome: Snowflake | undefined;
    leave: Snowflake | undefined;
    log: Snowflake | undefined
}

export interface ChannelStats {
    welcome: Snowflake | undefined;
    leave: Snowflake | undefined;
    log: Snowflake | undefined
}
