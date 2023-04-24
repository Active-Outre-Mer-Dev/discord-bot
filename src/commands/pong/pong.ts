import { CommandBuilder } from "../../command-store.js";

const data = new CommandBuilder(async interaction => {
  await interaction.reply("Pong!");
})
  .setName("ping")
  .setDescription("Responds with pong!");

const run = data.run;
export { data, run };
