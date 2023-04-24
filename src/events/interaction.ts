import { CommandInteraction, Events } from "discord.js";
import { DiscordClient } from "../command-store.js";

type DiscordInteraction = Omit<CommandInteraction, "client"> & {
  client: DiscordClient;
};

export const event = {
  name: Events.InteractionCreate,
  async run(interaction: DiscordInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    console.log(command);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.run(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`);
      console.error(error);
    }
  }
};
