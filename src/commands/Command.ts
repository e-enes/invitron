import {
  AutocompleteInteraction,
  Awaitable,
  ChatInputCommandInteraction,
  Client,
  ContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

import CommandKeys from "./Keys.js";

namespace Command {
  export type ChatInput = ChatInputCommandInteraction;
  export type ContextMenu = ContextMenuCommandInteraction;
  export type UserContextMenu = UserContextMenuCommandInteraction;
  export type MessageContextMenu = MessageContextMenuCommandInteraction;
  export type Autocomplete = AutocompleteInteraction;
  export type Keys = CommandKeys;
}

abstract class Command {
  public applicationCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  public client!: Client<true>;

  protected constructor(public name: string) {}

  public initialize?(): Awaitable<void>;
  public executeAutocomplete?(interaction: Command.Autocomplete): Awaitable<void>;
  public executeChatInput?(interaction: Command.ChatInput, keys: Command.Keys): Awaitable<void>;
  public executeContextMenu?(interaction: Command.ContextMenu, keys: Command.Keys): Awaitable<void>;
  public executeMessageContextMenu?(interaction: Command.MessageContextMenu, keys: Command.Keys): Awaitable<void>;
  public executeUserContextMenu?(interaction: Command.UserContextMenu, keys: Command.Keys): Awaitable<void>;
}

export default Command;
