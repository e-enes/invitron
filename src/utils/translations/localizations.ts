import i18next from "i18next";
import { Collection } from "discord.js";

export interface Localization {
  "en-US": string;
  "en-GB": string;
  fr: string;
  nl: string;
  ru: string;
  vi: string;
}

interface OptionLocalization {
  name: Localization;
  description: Localization;
}

interface SubcommandLocalization {
  name: Localization;
  description: Localization;
  options?: { [key: string]: OptionLocalization };
}

interface SubcommandGroupLocalization {
  name: Localization;
  description: Localization;
  subcommands?: { [key: string]: SubcommandLocalization };
}

interface CommandLocalization {
  name: Localization;
  description: Localization;
  subcommandsGroups?: { [key: string]: SubcommandGroupLocalization };
  subcommands?: { [key: string]: SubcommandLocalization };
  options?: { [key: string]: OptionLocalization };
}

const localizations = new Collection<string, CommandLocalization>();

const initLocalization = () => {
  for (const [lang, data] of Object.entries(i18next.store.data)) {
    const commandsData = (data["translation"] as any).commands;

    for (const commandName in commandsData) {
      const commandData = commandsData[commandName]?.["data"];

      if (!commandData) continue;

      const command: CommandLocalization = localizations.get(commandName) ?? {
        name: {} as Localization,
        description: {} as Localization,
        subcommandsGroups: {} as { [key: string]: SubcommandGroupLocalization },
        subcommands: {} as { [key: string]: SubcommandLocalization },
        options: {} as { [key: string]: OptionLocalization },
      };

      handleLang(command, lang, commandData);

      if (commandData.subcommandsGroups) {
        handleSubcommandsGroups(command.subcommandsGroups!, lang, commandData.subcommandsGroups);
      }

      if (commandData.subcommands) {
        handleSubcommands(command.subcommands!, lang, commandData.subcommands);
      }

      if (commandData.options) {
        handleOptions(command.options!, lang, commandData.options);
      }

      localizations.set(commandName, command);
    }
  }
};

const handleLang = (
  command: CommandLocalization | SubcommandGroupLocalization | SubcommandLocalization | OptionLocalization,
  lang: string,
  data: { name: string; description: string }
): void => {
  if (lang === "en") {
    command.name["en-GB"] = data.name;
    command.name["en-US"] = data.name;
    command.description["en-GB"] = data.description;
    command.description["en-US"] = data.description;
  } else {
    command.name[lang] = data.name;
    command.description[lang] = data.description;
  }
};

const handleSubcommandsGroups = (
  subcommandsGroups: { [key: string]: SubcommandGroupLocalization },
  lang: string,
  data: { [key: string]: any }
): void => {
  for (const groupName in data) {
    const groupData = data[groupName];
    const subcommandGroup: SubcommandGroupLocalization = {
      name: {} as Localization,
      description: {} as Localization,
    };
    handleLang(subcommandGroup, lang, groupData);

    if (groupData.subcommands) {
      handleSubcommands(subcommandGroup.subcommands!, lang, groupData.subcommands);
    }

    subcommandsGroups[groupName] = subcommandGroup;
  }
};

const handleSubcommands = (
  subcommands: { [key: string]: SubcommandLocalization },
  lang: string,
  data: { [key: string]: any }
): void => {
  for (const subcommandName in data) {
    const subcommandData = data[subcommandName];
    const subcommand: SubcommandLocalization = {
      name: {} as Localization,
      description: {} as Localization,
    };
    handleLang(subcommand, lang, subcommandData);

    if (subcommandData.options) {
      handleOptions(subcommand.options!, lang, subcommandData.options);
    }

    subcommands[subcommandName] = subcommand;
  }
};

const handleOptions = (
  options: { [key: string]: OptionLocalization },
  lang: string,
  data: { [key: string]: any }
): void => {
  if (!options) {
    options = {};
  }

  for (const optionName in data) {
    const optionData = data[optionName];
    const option: OptionLocalization = {
      name: {} as Localization,
      description: {} as Localization,
    };

    handleLang(option, lang, optionData);
    options[optionName] = option;
  }
};

export { localizations, initLocalization as init };
