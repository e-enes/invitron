import { EmbedBuilder, WebhookClient } from "discord.js";

import config from "../config.js";

const webhookId = process.env?.WEBHOOK_ID;
const webhookToken = process.env?.WEBHOOK_TOKEN;

let webhookClient: WebhookClient;

if (webhookId && webhookToken) {
  webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });
}

process.on("uncaughtException", async (error) => {
  if (webhookClient) {
    await webhookClient
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
      .catch((e) => {
        console.error("Webhook Error", e);
        process.exit(1);
      });

    return;
  }

  console.error(error);
  process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
  if (webhookClient) {
    await webhookClient
      .send({
        embeds: [new EmbedBuilder().setTitle("Uncaught Rejection").setDescription(String(reason)).setColor(config.message.colors.error)],
      })
      .catch((e) => {
        console.error("Webhook Error", e);
        process.exit(1);
      });

    return;
  }

  console.error(reason);
  process.exit(1);
});
