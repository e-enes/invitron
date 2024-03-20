import {
  AnySelectMenuInteraction,
  Awaitable,
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  Client,
  MentionableSelectMenuInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
} from "discord.js";

import ComponentKeys from "./Keys.js";

namespace Component {
  export type Button = ButtonInteraction<"cached">;
  export type SelectMenu = AnySelectMenuInteraction<"cached">;
  export type ChannelSelectMenu = ChannelSelectMenuInteraction<"cached">;
  export type MentionableSelectMenu = MentionableSelectMenuInteraction<"cached">;
  export type StringSelectMenu = StringSelectMenuInteraction<"cached">;
  export type UserSelectMenu = UserSelectMenuInteraction<"cached">;
  export type Modal = ModalSubmitInteraction<"cached">;
  export type Keys = ComponentKeys;
}

class Component {
  public client!: Client<true>;

  public constructor(public key: string) {}

  public executeButton?(interaction: Component.Button, keys: Component.Keys): Awaitable<void>;
  public executeSelectMenu?(interaction: Component.SelectMenu, keys: Component.Keys): Awaitable<void>;
  public executeChannelSelectMenu?(interaction: Component.ChannelSelectMenu, keys: Component.Keys): Awaitable<void>;
  public executeMentionableSelectMenu?(
    interaction: Component.MentionableSelectMenu,
    keys: Component.Keys
  ): Awaitable<void>;
  public executeStringSelectMenu?(interaction: Component.StringSelectMenu, keys: Component.Keys): Awaitable<void>;
  public executeUserSelectMenu?(interaction: Component.UserSelectMenu, keys: Component.Keys): Awaitable<void>;
  public executeModal?(interaction: Component.Modal, keys: Component.Keys): Awaitable<void>;
}

export default Component;
