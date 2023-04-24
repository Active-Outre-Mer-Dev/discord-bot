import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { pathToFileURL } from "node:url";

dotenv.config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_SERVER_ID;

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(process.cwd(), "dist", "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier

  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  const folderPath = path.join(foldersPath, folder);
  //   const command = require(filePath);
  const files = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const command = await import(pathToFileURL(filePath).href);
    console.log(filePath);
    if ("data" in command && "run" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] The command at ${folderPath} is missing a required "data" or "run" property.`);
    }
  }
}
// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

//  and deploy your commands!
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
