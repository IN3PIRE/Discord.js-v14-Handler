const { Client, IntentsBitField, Collection, PermissionsBitField } = require('discord.js');
const fs = require('fs');
require('dotenv').config(); 

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildMembers] });

client.commands = new Collection();
client.slashCommands = new Collection();
client.events = new Collection();


const slashCommandFiles = fs.readdirSync('./slashCommands').filter(file => file.endsWith('.js'));
for (const file of slashCommandFiles) {
  const slashCommand = require(`./slashCommands/${file}`);
  client.slashCommands.set(slashCommand.data.name, slashCommand);
}


const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}


const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  const eventName = file.split('.')[0];
  client.events.set(eventName, event);
  client.on(eventName, (...args) => event.execute(...args, client));
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  for (const slashCommand of client.slashCommands.values()) {
    try {
      await client.application.commands.create(slashCommand.data);
      console.log(`Registered slash command ${slashCommand.data.name}`);
    } catch (error) {
      console.error(`Failed to register slash command ${slashCommand.data.name}:`, error);
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const prefix = '.';

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('There was an error while executing this command!');
  }
});

client.login(process.env.TOKEN); 
