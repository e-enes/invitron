import i18next from "i18next";
import { Collection } from "discord.js";

export interface Localization {
  name: string;
  names: Record<string, string>;
  description: string;
  descriptions: Record<string, string>;
  options: Record<string, Localization>;
}

interface CommandData {
  [key: string]: any;
}

const localizations = new Collection<string, Localization>();

const initLocalization = () => {
  for (const lang of Object.keys(i18next.store.data)) {
    const commands: Record<string, { data?: CommandData }> =
      (i18next.store.data[lang]["translation"] as any).commands || {};

    for (const [name, { data }] of Object.entries(commands)) {
      console.log(lang);
      if (!data) return;

      const command = localizations.get(name) ?? {
        name: "",
        names: {},
        description: "",
        descriptions: {},
        options: {},
      };

      localizations.set(name, command);

      if (lang === "en") {
        command.name = data.name ?? command.names[lang];
        command.description = data.description ?? command.descriptions[lang];
      } else {
        command.names[lang] = data.name ?? command.names[lang];
        command.descriptions[lang] = data.description ?? command.descriptions[lang];
      }

      initOptions(command.options, data.options, lang);
    }
  }

  console.log(localizations.get("invites"));
};

const initOptions = (entry: Record<string, Localization>, data: CommandData, lang: string) => {
  if (!data) return;

  for (const [key, { name, description, options }] of Object.entries(data)) {
    const option = entry[key] ?? { names: {}, descriptions: {}, options: {} };
    entry[key] = option;

    if (lang === "en") {
      option.name = name ?? option.names[lang];
      option.description = description ?? option.descriptions[lang];
    } else {
      option.names[lang] = name ?? option.names[lang];
      option.descriptions[lang] = description ?? option.descriptions[lang];
    }

    if (options) {
      initOptions(option.options, options, lang);
    }
  }
};

export { localizations, initLocalization as init };
