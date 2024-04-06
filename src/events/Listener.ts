import { Awaitable, Client, ClientEvents } from "discord.js";

class Listener {
  public client!: Client<true>;
  public constructor(
    public name: keyof ClientEvents,
    public once: boolean = false
  ) {}
  public execute?(...args: ClientEvents[keyof ClientEvents]): Awaitable<void>;
}

export default Listener;
