import { CommandBuilder } from "../../command-store.js";
import { NotionError, getCategories, getLinks } from "../../notion.js";

const cache = getLinks();
const categories = await getCategories();

console.log(categories);
const data = new CommandBuilder(async interaction => {
  try {
    if ("getString" in interaction.options && typeof interaction.options.getString === "function") {
      const label = (interaction.options.getString("category") as string).replace(/-/gi, " ");
      const followUpMessage = `Here is a list of all ${label} resources:`;
      await interaction.deferReply();

      if (interaction.channel.isThread()) {
        const embeds = await cache(label);
        await interaction.followUp(followUpMessage);
        for (const embed of embeds) {
          await interaction.followUp(embed);
        }
        return;
      }

      if ("threads" in interaction.channel) {
        const userId = interaction.user.id;

        const embeds = await cache(label);

        await interaction.followUp(followUpMessage);
        const thread = await interaction.channel.threads.create({
          name: `${interaction.user.username}-thread`.toLowerCase(),
          autoArchiveDuration: 60
        });
        await thread.members.add(userId);
        await thread.join();

        for (const embed of embeds) {
          await thread.send(embed);
        }
      }
    }
  } catch (error) {
    if (error instanceof NotionError) {
      await interaction.followUp("There was an error getting the resources from notion.");
    } else {
      await interaction.followUp("There was an error getting the resources.");
    }
  }
})
  .setName("get-links")
  .setDescription("Get devlinks categories")
  .addStringOption(option =>
    option
      .setName("category")
      .setDescription("Category for links")
      .setRequired(true)
      .addChoices(...categories)
  );

const run = data.run;

export { run, data };
