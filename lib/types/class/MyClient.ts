import {Client} from "discord.js";
import Command from "../interface/Command";
import {ChannelStats} from "../interface/channel";

export default class MyClient extends Client {
    cache: {
        invites: Map<string, Map<string, { uses: number, memberId: string }>>,
        links: Map<string, Map<string, string>>,
        register: Command[],
        channels: Map<string, ChannelStats>
    } = {
        invites: new Map(),
        links: new Map(),
        register: [],
        channels: new Map()
    };
}
