const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    await guild.members.fetch(guild.ownerId).then(owner => {
      guild.invites.create(guild.systemChannelId || guild.rulesChannelId || guild.publicUpdatesChannelId || guild.afkChannelId || guild.id, {
        maxAge: 0,
        maxUses: 0
      }).then(invite => {
        const humanCount = guild.members.cache.filter(member => !member.user.bot).size;

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('New Server Joined!')
          .addFields(
            { name: 'Server Name', value: guild.name },
            { name: 'Server ID', value: guild.id },
            { name: 'Owner Tag', value: owner.user.tag },
            { name: 'Owner ID', value: owner.user.id },
            { name: 'Member Count (Humans)', value: humanCount.toString() },
            { name: 'Invite Link', value: `[Permanent Invite](${invite.url})` }
          )
          .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
          .setTimestamp();

        client.users.fetch(client.ownerId).then(user => {
          user.send({ embeds: [embed] })
            .then(() => console.log(`Sent guild join info for ${guild.name} to bot owner.`))
            .catch(error => console.error(`Could not send guild join info to bot owner: ${error}`));
        });
      }).catch(err => {
        console.log("Couldn't create invite for " + guild.name + ", reason: " + err);
        const humanCount = guild.members.cache.filter(member => !member.user.bot).size;

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('New Server Joined!')
          .addFields(
            { name: 'Server Name', value: guild.name },
            { name: 'Server ID', value: guild.id },
            { name: 'Owner Tag', value: owner.user.tag },
            { name: 'Owner ID', value: owner.user.id },
            { name: 'Member Count (Humans)', value: humanCount.toString() },
            { name: 'Invite Link', value: `Could not create invite` }
          )
          .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
          .setTimestamp();

        client.users.fetch(client.ownerId).then(user => {
          user.send({ embeds: [embed] })
            .then(() => console.log(`Sent guild join info for ${guild.name} to bot owner.`))
            .catch(error => console.error(`Could not send guild join info to bot owner: ${error}`));
        });
      });
    }).catch(err => {
      console.log("Couldn't fetch owner of " + guild.name + ", reason: " + err)
    });
  },
};
