import { Client } from "discord.js";

import { glob } from "glob";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

import Command from "../commands/Command.js";
import Component from "../components/Component.js";
import Listener from "../events/Listener.js";

import Logger from "./Logger.js";

const _dirname = dirname(fileURLToPath(import.meta.url));

export const loadEvents = async (client: Client): Promise<void> => {
  const path = join(_dirname, "..", "events").replace(/\\/g, "/");

  const files = await glob(`${path}/*/**/*.js`);

  let count = 0;

  for (const file of files) {
    const listener = new (await import(`${pathToFileURL(file)}`)).default() as Listener;

    listener.client = client as Client<true>;

    client[listener.once ? "once" : "on"](listener.name, listener.execute!.bind(listener));

    count++;
  }

  Logger.info(`Loaded ${count} listeners.`);
};

export const loadCommands = async (client: Client): Promise<void> => {
  const path = join(_dirname, "..", "commands").replace(/\\/g, "/");

  const files = await glob(`${path}/*/**/*.js`);

  for (const file of files) {
    const command = new (await import(`${pathToFileURL(file)}`)).default() as Command;

    command.client = client as Client<true>;

    await command.initialize?.();

    client.commands.set(command.name, command);
  }

  Logger.info(`Loaded ${client.commands.size} commands.`);
};

export const loadComponents = async (client: Client): Promise<void> => {
  const path = join(_dirname, "..", "components").replace(/\\/g, "/");

  const files = await glob(`${path}/*/**/*.js`);

  for (const file of files) {
    const component = new (await import(`${pathToFileURL(file)}`)).default() as Component;

    component.client = client as Client<true>;

    client.components.set(component.key, component);
  }

  Logger.info(`Loaded ${client.components.size} components.`);
};
