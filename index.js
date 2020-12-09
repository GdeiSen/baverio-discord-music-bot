/**
 * Module Imports
 */
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const {TOKEN,PREFIX } = require("./util/EvobotUtil");

const fs = require("fs");
const { groupCollapsed } = require("console");
const client = new Client({ disableMentions: "everyone" });
client.commands = new Collection();
client.aliases = new Collection();
client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;

client.queue = new Map();
const cooldowns = new Collection();

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
  client.user.setActivity(`в разработке`, { type: "LISTENING" });
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);


fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err)

  let jsfile = files.filter(f => f.split(".").pop() === "js") 
  if(jsfile.length <= 0) {
       return console.log("[LOGS] Couldn't Find Commands!");
  }

  jsfile.forEach((f, i) => {
      let pull = require(`./commands/${f}`);
      client.commands.set(pull.config.name, pull);  
      pull.config.aliases.forEach(alias => {
          client.aliases.set(alias, pull.config.name)
      });
  });
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return; 
  if(message.author.bot || message.channel.type === "dm") return;

  let prefix = "~";
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = message.content.substring(message.content.indexOf(' ')+1);
  if(!message.content.startsWith(prefix)) return;
  //if(message.content != `~clear ${args}` 
  //&& message.content != `~play ${args}` 
  //&& message.content != `~8ball ${args}` 
  //&& message.content != `~mute ${args}`
  //&& message.content != `~react_role` 
  //&& message.content != `~unmute ${args}`
  //&& message.content != `~loop`
  //&& message.content != `~pause`
  //) return
  let commandfile = client.commands.get(cmd.slice(prefix.length)) || client.commands.get(client.aliases.get(cmd.slice(prefix.length)))
  try{
  if(commandfile) commandfile.run(client, message, args);
}
  catch(error){message.send("Ошибка в синтаксисе");return}
});
