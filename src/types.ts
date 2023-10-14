import { Snowflake } from "discord.js";

type InviteResultsRow = {
  id: number;
  user: Snowflake;
  guild: Snowflake;
  inviter: Snowflake;
  code: string;
  fake: number;
  inactive: number;
};

type InviteResults = {
  total: number;
  leaves: number;
  bonus: number;
  fake: number;
};

type InviteStats = {
  total: number;
  invites: number;
  leaves: number;
  fake: number;
  bonus: number;
};

type WhoUsed = {
  [key: Snowflake]: boolean;
};

type LeaderboardResults = {
  inviter: Snowflake;
  total: number;
};

type LeaderboardStats = {
  [key: Snowflake]: number;
};

type LinkResults = {
  user: Snowflake;
  code: string;
};

type LinkStats = {
  [key: Snowflake]: string;
};

type Command = {
  name: string;
  description: string;
  options: {
    name: string;
    description: string;
    type: number;
    required: boolean;
  }[];
  type: number;
};

type ChannelResults = {
  id: number;
  setup: boolean;
  guild: Snowflake;
  welcome: Snowflake;
  leave: Snowflake;
  log: Snowflake;
};

type ChannelStats = {
  setup: boolean;
  welcome: Snowflake | null;
  leave: Snowflake | null;
  log: Snowflake | null;
};

type CacheGuild = {
  invites: Map<string, CacheInvite>;
  links: Map<string, Snowflake>;
  channels: ChannelStats;
};

type CacheInvite = {
  uses: number;
  memberId: Snowflake;
};

export type {
  InviteResultsRow,
  InviteResults,
  InviteStats,
  WhoUsed,
  LeaderboardResults,
  LeaderboardStats,
  LinkResults,
  LinkStats,
  Command,
  ChannelResults,
  ChannelStats,
  CacheGuild,
  CacheInvite,
};
