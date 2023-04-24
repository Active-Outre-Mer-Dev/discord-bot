import { Events } from "discord.js";
import type { Interaction } from "discord.js";
export const event = {
  name: Events.ClientReady,
  once: true,
  /**@param interaction {import('discord.js').Interaction} */
  async run(client: Interaction) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  }
};
