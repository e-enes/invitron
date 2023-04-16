import {Client} from "discord.js";
import Command from "../interface/Command";
import ChannelStats from "../interface/ChannelStats";

export default class MyClient extends Client {
    cache: {
        invites: Map<string, Map<string, number>>,
        register: Command[],
        channels: Map<string, ChannelStats>
    } = {
        invites: new Map(),
        register: [],
        channels: new Map()
    };
}
