import {Snowflake} from "discord.js";

export default interface BonusResults {
    id: number,
    user: Snowflake,
    guild: Snowflake,
    bonus: number
}
