import i18next, { InitOptions } from "i18next";
import FsBackend, { FsBackendOptions } from "i18next-fs-backend";

import Logger from "../Logger.js";
import { init } from "./localizations.js";

const options: InitOptions<FsBackendOptions> = {
  fallbackLng: ["en", "fr", "nl", "ru", "vi"],
  initImmediate: true,
  returnNull: true,
  backend: {
    loadPath: "locales/{{lng}}.json",
    addPath: "locales/{{lng}}.json",
  },
  interpolation: {
    escapeValue: false,
  },
};

await i18next
  .use(FsBackend)
  .init<FsBackendOptions>(options)
  .then(() => {
    Logger.info("Loaded i18next");
  });

init();
