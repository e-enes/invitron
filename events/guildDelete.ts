import {
    Events,
    Guild
} from "discord.js";
import MyClient from "../lib/types/class/MyClient";

export default {
    once: false,
    name: Events.GuildDelete,
    async execute(guild: Guild, client: MyClient) {
        client.cache.invites.delete(guild.id);
        client.cache.links.delete(guild.id);
        client.cache.channels.delete(guild.id);
    }
}
