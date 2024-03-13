const { env } = process;

const config = {
  messages: {
    footer: {
      text: "Powered by Enes", // Required
      icon: "https://cdn.discordapp.com/avatars/254730482770640896/61ee68abc9c0309841542329a5cd9837.png", // Optional
    },
    colors: {
      error: 0xff6961, // Required
      warn: 0xffcc00, // Required
      success: 0x7abd7e, // Required
    },
  },
  presence: {
    status: "online", // dnd, idle, invisible, online
    activities: {
      name: "Sene Bot", // Required
      type: 3, // 0 (Playing), 1 (Streaming), 2 (Listening), 3 (Watching), 4 (Custom), 5 (Competing)
    },
  },
  /**
   * Please refrain from making any alterations to the code below unless you fully understand its functionality.
   */
  useSqlite: env.USE_SQLITE === "true",
  mysql: {
    host: env.MYSQL_HOST!,
    port: Number(env.MYSQL_PORT)!,
    user: env.MYSQL_USER!,
    database: env.MYSQL_DATABASE!,
    password: env.MYSQL_PASSWORD!,
  },
  token: env.BOT_TOKEN!,
};

export default config;
