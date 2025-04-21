const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    const activities = [
      `${client.guilds.cache.size} servers`,
      'with Discord.js v14',
      'IN3PIRE',
    ];

    let i = 0;
    setInterval(() => {
      client.user.setPresence({
        status: 'dnd',
        activities: [{
          name: activities[i++ % activities.length],
          type: ActivityType.Playing,
        }],
      });
    }, 15000);
  },
};
