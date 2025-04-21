const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// —[Client Setup]—
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// —[Collections]—
client.commands = new Collection();
client.slashCommands = new Collection();
client.events = new Collection();

// —[Command Loading]—
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// —[Slash Command Loading]—
const slashCommandsPath = path.join(__dirname, 'slashCommands');
const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
  const filePath = path.join(slashCommandsPath, file);
  const slashCommand = require(filePath);

  if ('data' in slashCommand && 'execute' in slashCommand) {
    client.slashCommands.set(slashCommand.data.name, slashCommand);
  } else {
    console.log(`[WARNING] The slash command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// —[Event Loading]—
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  const eventName = file.split('.')[0];

  if (event.once) {
    client.once(eventName, (...args) => event.execute(...args, client));
  } else {
    client.on(eventName, (...args) => event.execute(...args, client));
  }
  client.events.set(eventName, event);
}

// —[Slash Command Registration]—
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  const commands = Array.from(client.slashCommands.values()).map(cmd => cmd.data.toJSON());

  (async () => {
    try {
      console.log(`Started refreshing ${commands.length} application (/) commands.`);

      const data = await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );

      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
      console.error(error);
    }
  })();
});

// —[Interaction Handling]—
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction, client);
    console.log(`[COMMAND] ${interaction.user.tag} executed /${interaction.commandName}`);
  } catch (error) {
    console.error(`Error executing command ${command.commandName}:`, error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// —[Message Handling]—
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
    console.log(`[COMMAND] ${message.author.tag} executed ${commandName}`);
  } catch (error) {
    console.error(`Error executing command ${command.name}:`, error);
    message.reply('There was an error while executing this command!');
  }
});

// —[Login]—
client.login(process.env.TOKEN);
