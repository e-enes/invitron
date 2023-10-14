import { Client as DiscordClient, Snowflake } from "discord.js";

import { Command, CacheGuild, CacheInvite, ChannelStats } from "./types";

class Client extends DiscordClient {
  private cache: {
    guilds: Map<Snowflake, CacheGuild>; // Stores cache data for guilds
    register: Command[]; // Stores registered commands
  } = {
    guilds: new Map(),
    register: [],
  };

  /**
   * Get the cache for a specific guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild
   * @returns {CacheGuild | undefined} - The specific guild data from the cache
   */
  public getGuild(guildId: Snowflake): CacheGuild | undefined {
    return this.cache.guilds.get(guildId);
  }

  /**
   * Set the cache for a specific guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild
   * @param {CacheGuild} cacheGuild - The cache data to set for the guild
   */
  public setGuild(guildId: Snowflake, cacheGuild: CacheGuild) {
    this.cache.guilds.set(guildId, cacheGuild);
  }

  /**
   * Delete the cache for a specific guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild to delete the cache for
   */
  public deleteGuild(guildId: Snowflake) {
    this.cache.guilds.delete(guildId);
  }

  /**
   * Get the invites cache for a specific guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild
   * @returns {Map<string, CacheInvite> | undefined} - The invites cache for the guild
   */
  public getInvites(guildId: Snowflake): Map<string, CacheInvite> | undefined {
    return this.cache.guilds.get(guildId)?.invites;
  }

  /**
   * Get a specific invite from the cache of a guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild
   * @param {string} code - The code of the invite to retrieve
   * @returns {CacheInvite | undefined} - The specific invite data from the cache
   */
  public getInvite(guildId: Snowflake, code: string): CacheInvite | undefined {
    return this.cache.guilds.get(guildId)?.invites.get(code);
  }

  /**
   * Set a specific invite in the cache of a guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild
   * @param {string} code - The code of the invite to set
   * @param {CacheInvite} cacheInvite - The invite data to set in the cache
   */
  public setInvite(guildId: Snowflake, code: string, cacheInvite: CacheInvite) {
    this.cache.guilds.get(guildId)?.invites.set(code, cacheInvite);
  }

  /**
   * Delete a specific invite from the cache of a guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild
   * @param {string} code - The code of the invite to delete
   */
  public deleteInvite(guildId: Snowflake, code: string) {
    this.cache.guilds.get(guildId)?.invites.delete(code);
  }

  /**
   * Get the links cache for a specific guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild
   * @returns {Map<string, string> | undefined} - The links cache for the guild
   */
  public getLinks(guildId: Snowflake): Map<string, string> | undefined {
    return this.cache.guilds.get(guildId)?.links;
  }

  /**
   * Get a specific link from the cache of a guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild
   * @param {Snowflake} memberId - The ID of the member
   * @returns {string | undefined} - The specific link from the cache
   */
  public getLink(guildId: Snowflake, memberId: Snowflake): string | undefined {
    const links = this.cache.guilds.get(guildId)!.links;
    const link = [...links.entries()].find(([, memberID]) => memberID === memberId);

    if (link) {
      return link[0];
    }
  }

  /**
   * Set a specific link in the cache of a guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild
   * @param {string} code - The code of the link to set
   * @param {Snowflake} memberId - The ID of the member
   */
  public setLink(guildId: Snowflake, code: string, memberId: Snowflake) {
    this.cache.guilds.get(guildId)?.links.set(code, memberId);
  }

  /**
   * Delete a specific link from the cache of a guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild
   * @param {string} code - The code of the link to delete
   */
  public deleteLink(guildId: Snowflake, code: string) {
    this.cache.guilds.get(guildId)?.links.delete(code);
  }

  /**
   * Get the channels cache for a specific guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild
   * @returns {ChannelStats | undefined} - The channels cache for the guild
   */
  public getChannels(guildId: Snowflake): ChannelStats | undefined {
    return this.cache.guilds.get(guildId)?.channels;
  }

  /**
   * Set the channels cache for a specific guild
   *
   * @method
   * @param {Snowflake} guildId - guildId - The ID of the guild
   * @param {ChannelStats} cacheChannels - The channels data to set in the cache
   */
  public setChannels(guildId: Snowflake, cacheChannels: ChannelStats) {
    const guildCache = this.cache.guilds.get(guildId);

    if (guildCache) {
      guildCache.channels = cacheChannels;
    }
  }

  /**
   * Delete the channels cache for a specific guild
   *
   * @method
   * @param {Snowflake} guildId - The ID of the guild to delete the channels cache for
   */
  public deleteChannels(guildId: Snowflake) {
    const guildCache = this.cache.guilds.get(guildId);

    if (guildCache) {
      guildCache.channels.setup = false;
    }
  }

  /**
   * Get the register of commands
   *
   * @method
   * @returns {Command[]} - The list of registered commands
   */
  public getRegisters(): Command[] {
    return this.cache.register;
  }

  /**
   * Set a command in the register
   *
   * @method
   * @param {Command} command - The command to add to the register
   */
  public setRegister(command: Command) {
    this.cache.register.push(command);
  }
}

export default Client;
