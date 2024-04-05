import { EmbedBuilder, WebhookClient } from "discord.js";

import config from "../config.js";

const webhookId = process.env?.WEBHOOK_ID;
const webhookToken = process.env?.WEBHOOK_TOKEN;

let webhookClient: WebhookClient;

if (webhookId && webhookToken) {
  webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });
}

process.on("uncaughtException", (error) => {
  webhookClient
    .send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Uncaught Exception")
          .setDescription(
            `**Message:** ${error?.message}\n\n**Name:** ${error?.name}\n**Cause:** ${error?.cause}\n**Source:** ${String(error?.cause)}\n\n**Stack:**\n\`${error?.stack}\``
          )
          .setColor(config.message.colors.error),
      ],
    })
    ?.catch(() => {
      console.error(error);
      process.exit(1);
    });
});

process.on("unhandledRejection", (reason) => {
  webhookClient
    .send({
      embeds: [new EmbedBuilder().setTitle("Uncaught Rejection").setDescription(String(reason)).setColor(config.message.colors.error)],
    })
    .catch(() => {
      console.error(reason);
      process.exit(1);
    });
});
