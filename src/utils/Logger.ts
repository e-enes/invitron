import chalk from "chalk";

enum Level {
  Info,
  Warn,
  Error,
}

const log = (level: Level, ...args: any[]): void => {
  const formattedLevel = {
    [Level.Info]: chalk.blue("[INFO]"),
    [Level.Warn]: chalk.yellow("[WARN]"),
    [Level.Error]: chalk.red("[ERROR]"),
  }[level];
  const formattedISO = chalk.cyanBright(`[${new Date().toISOString()}]`);

  console.log(`${formattedISO}  ${formattedLevel} `, ...args);
};

namespace Logger {
  export const info = (...args: any[]) => log(Level.Info, ...args);
  export const warn = (...args: any[]) => log(Level.Warn, ...args);
  export const error = (...args: any[]) => log(Level.Error, ...args);
}

export default Logger;
