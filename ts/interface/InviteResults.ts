import {Snowflake} from "discord.js";

export default interface InviteResults {
    id: number,
    user: Snowflake,
    guild: Snowflake,
    inviter: Snowflake,
    inactive: boolean
}