import {Snowflake} from "discord.js";

export default interface ChannelStats {
    welcome: Snowflake | undefined;
    leave: Snowflake | undefined;
    log: Snowflake | undefined
}
