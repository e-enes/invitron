import { Snowflake } from "discord.js";


export interface InviteResultsRow {
    id: number;
    user: Snowflake;
    guild: Snowflake;
    inviter: Snowflake;
    code: string;
    fake: number;
    inactive: number
}

export interface InviteResults {
    total: number;
    leaves: number;
    bonus: number;
    fake: number
}

export interface InviteStats {
    total: number;
    invites: number;
    leaves: number;
    fake: number;
    bonus: number
}

export interface WhoUsed {
    [key: Snowflake]: boolean
}

export interface LeaderboardResults {
    inviter: Snowflake;
    total: number;
}

export interface LeaderboardStats {
    [key: Snowflake]: number
}

export interface LinkResults {
    user: Snowflake
    code: string
}

export interface LinkStats {
    [key: Snowflake]: string
}
