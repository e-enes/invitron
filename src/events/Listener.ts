import { Awaitable, Client, ClientEvents } from "discord.js";

type EventKey = keyof ClientEvents;

class Listener<T extends EventKey = EventKey> {
  public client!: Client<true>;
  
  public constructor(
    public name: T,
    public once: boolean = false
  ) {}
  
  public execute?(...args: ClientEvents[T]): Awaitable<void>;
}

export default Listener;
