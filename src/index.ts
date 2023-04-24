import { GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { DiscordClient } from "./command-store.js";
dotenv.config();

const token = process.env.DISCORD_TOKEN;

const client = new DiscordClient({ intents: [GatewayIntentBits.Guilds] });
const commandsPath = path.join(process.cwd(), "dist", "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(pathToFileURL(filePath).href);
  //   Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "run" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "run" property.`);
  }
}

//Dynamically import events from events folder
const eventsPath = path.join(process.cwd(), "dist", "events");
const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventsFiles) {
  const filePath = path.join(eventsPath, file);
  const { event } = await import(pathToFileURL(filePath).href);
  if (event.once) {
    client.once(event.name, (...args) => {
      try {
        event.run(...args);
      } catch (error) {
        console.log("Error", error);
      }
    });
  } else {
    client.on(event.name, async (...args) => {
      try {
        await event.run(...args);
      } catch (error) {
        console.log("Error", error);
      }
    });
  }
}

client.login(token);
