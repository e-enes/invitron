import {Events, Guild} from "discord.js";
import MyClient from "../ts/class/MyClient";

export default {
    once: false,
    name: Events.GuildDelete,
    async execute(guild: Guild, client: MyClient) {
        client.invites.delete(guild.id);
    }
}
