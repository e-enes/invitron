import {ApplicationCommand, Collection} from "discord.js";
import MyClient from "../ts/class/MyClient";
import Command from "../ts/interface/Command";

export async function register(client: MyClient, commands: Command[]) {
    const currentCommands: Collection<string, ApplicationCommand> | undefined = await client.application?.commands.fetch()!;

    const newCommands = commands.filter((command) => !currentCommands.some((c) => c.name === command.name));
    for (let newCommand of newCommands) {
        await client.application?.commands.create(newCommand);
    }

    const deletedCommands = currentCommands.filter((command) => !commands.some((c) => c.name === command.name)).toJSON()!;
    for (let deletedCommand of deletedCommands) {
        await deletedCommand.delete();
    }

    const updatedCommands = commands.filter((command) => currentCommands.some((c) => c.name === command.name));
    for (let updatedCommand of updatedCommands) {
        const newCommand = updatedCommand;
        const previousCommand = currentCommands.find((c) => c.name === updatedCommand.name)!;
        let modified = false;
        if (previousCommand.description !== newCommand.description) modified = true;
        if (!ApplicationCommand.optionsEqual(previousCommand.options ?? [], newCommand.options ?? [])) modified = true;
        if (modified) await previousCommand.edit(newCommand);
    }
}
