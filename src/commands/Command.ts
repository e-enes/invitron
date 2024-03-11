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

namespace Command {
  export type ChatInput = ChatInputCommandInteraction;
  export type ContextMenu = ContextMenuCommandInteraction;
  export type UserContextMenu = UserContextMenuCommandInteraction;
  export type MessageContextMenu = MessageContextMenuCommandInteraction;
  export type Autocomplete = AutocompleteInteraction;
}

class Command {
  public applicationCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  public client!: Client<true>;

  public constructor(public name: string) {}

  public initialize?(): Awaitable<void>;
  public executeAutocomplete?(interaction: Command.Autocomplete): Awaitable<void>;
  public executeChatInput?(interaction: Command.ChatInput): Awaitable<void>;
  public executeContextMenu?(interaction: Command.ContextMenu): Awaitable<void>;
  public executeMessageContextMenu?(interaction: Command.MessageContextMenu): Awaitable<void>;
  public executeUserContextMenu?(interaction: Command.UserContextMenu): Awaitable<void>;
}

export default Command;
