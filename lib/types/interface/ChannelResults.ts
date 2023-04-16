import {Snowflake} from "discord.js";

export default interface ChannelResults {
    id: number;
    setup: number;
    guild: Snowflake;
    welcome: Snowflake | undefined;
    leave: Snowflake | undefined;
    log: Snowflake | undefined
}