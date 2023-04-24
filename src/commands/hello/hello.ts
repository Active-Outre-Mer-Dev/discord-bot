import { CommandBuilder } from "../../command-store.js";

const data = new CommandBuilder(async interaction => {
  if ("getString" in interaction.options && typeof interaction.options.getString === "function") {
    const word = interaction.options.getString("word") ?? "There";
    await interaction.reply(`Hello ${word}`);
  }
})
  .setName("hello")
  .setDescription("Says hello")
  .addStringOption(option => option.setName("word").setDescription("Word to add"));

const run = data.run;

export { data, run };
