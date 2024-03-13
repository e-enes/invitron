import i18next, { InitOptions } from "i18next";
import Backend, { FsBackendOptions } from "i18next-fs-backend";

import Logger from "../Logger.js";

const options: InitOptions & { backend: FsBackendOptions } = {
  lng: "en",
  initImmediate: true,
  backend: {
    loadPath: "languages/{{lng}}/{{ns}}.json",
  },
};

await i18next
  .use(Backend)
  .init(options)
  .then(() => {
    Logger.info("Loaded i18next");
  });
