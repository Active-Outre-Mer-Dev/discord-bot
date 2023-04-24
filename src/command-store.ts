import { Collection, Client, SlashCommandBuilder } from "discord.js";
import type { CommandInteraction, ClientOptions, Interaction } from "discord.js";

type Command = { name: string; run: (interaction: Interaction) => Promise<void> };
type DiscordInteraction = Omit<CommandInteraction, "client"> & {
  client: DiscordClient;
};

class DiscordClient extends Client {
  commands: Collection<string, Command>;
  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection<string, Command>();
  }
}

class CommandBuilder extends SlashCommandBuilder {
  constructor(public run: (interaction: DiscordInteraction) => Promise<void>) {
    super();
    this.run = run;
  }
}
export { DiscordClient, CommandBuilder };
