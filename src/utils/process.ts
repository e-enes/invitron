import Logger from "./Logger.js";

process.on("uncaughtException", async (error) => {
	Logger.error(error);
});

process.once("SIGUSR2", () => {
	process.kill(process.pid, "SIGUSR2");
});

process.on("SIGINT", () => {
	process.kill(process.pid, "SIGINT");
});
