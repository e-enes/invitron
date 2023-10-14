import { ApplicationCommand, Collection } from "discord.js";

import Client from "../client";
import { Command } from "../types";

/**
 * Registers and updates Discord application commands based on the provided commands.
 *
 * @param {Client} client - The Discord client.
 * @param {Command[]} commands - The array of commands to register.
 * @returns {Promise<void>} - A Promise that resolves when the registration is complete.
 */
export const register = async (client: Client, commands: Command[]): Promise<void> => {
  const currentCommands: Collection<string, ApplicationCommand> | undefined =
    await client.application?.commands.fetch();

  if (currentCommands === undefined) {
    throw new Error("Unable to retrieve the bot's slash commands.");
  }

  const newCommands = commands.filter(
    command => !currentCommands.some(c => c.name === command.name)
  );
  for (const newCommand of newCommands) {
    await client.application?.commands.create(newCommand);
  }

  const deletedCommands = currentCommands
    .filter(command => !commands.some(c => c.name === command.name))
    .toJSON()!;
  for (const deletedCommand of deletedCommands) {
    await deletedCommand.delete();
  }

  const updatedCommands = commands.filter(command =>
    currentCommands.some(c => c.name === command.name)
  );
  for (const updatedCommand of updatedCommands) {
    const newCommand = updatedCommand;
    const previousCommand = currentCommands.find(c => c.name === updatedCommand.name)!;
    let modified = false;
    if (previousCommand.description !== newCommand.description) modified = true;
    if (!ApplicationCommand.optionsEqual(previousCommand.options ?? [], newCommand.options ?? []))
      modified = true;
    if (modified) await previousCommand.edit(newCommand);
  }
};
