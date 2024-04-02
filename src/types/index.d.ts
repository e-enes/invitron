export type CachedInvite = {
  member: string;
  uses: number;
  source?: string;
};

export type ContextGuildMember = {
  language?: string;
  send?: CallableFunction;
  role?: string;
  ownInvite?: boolean;
  older?: number;
  profilePic?: boolean;
  firstJoin?: boolean;
  originalInviter?: boolean;
};
