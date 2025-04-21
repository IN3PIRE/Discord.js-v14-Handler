const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildDelete',
  async execute(guild, client) {
    const humanCount = guild.members.cache.filter(member => !member.user.bot).size;

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Left a Server')
      .addFields(
        { name: 'Server Name', value: guild.name },
        { name: 'Server ID', value: guild.id },
        { name: 'Member Count (Humans)', value: humanCount.toString() }
      )
      .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
      .setTimestamp();

    client.users.fetch(client.ownerId).then(user => {
      user.send({ embeds: [embed] })
        .then(() => console.log(`Sent guild leave info for ${guild.name} to bot owner.`))
        .catch(error => console.error(`Could not send guild leave info to bot owner: ${error}`));
    });
  },
};
