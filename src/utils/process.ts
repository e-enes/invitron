import Logger from "./Logger.js";

process.on("uncaughtException", async (error) => {
  Logger.error(error);
});
