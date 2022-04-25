const { QueryType } = require('discord-player');

module.exports = {
   name: 'play',
   aliases: ['p'],
   description: 'Joins and plays a video from youtube',
   async execute(message, args) {
      if (!args[0]) return await message.reply('include what you want to play');

      const res = await player.search(args.join(' '), {
         requestedBy: message.member,
         searchEngine: QueryType.AUTO,
      });

      if (!res || !res.tracks.length) return message.reply('no results found');

      const queue = await player.createQueue(message.guild, {
         metadata: message.channel,
      });

      try {
         if (!queue.connection)
            await queue.connect(message.member.voice.channel);
      } catch {
         await player.deleteQueue(message.guild.id);
         return message.reply('was not able to join your vc');
      }

      message
         .reply(
            `**1:** ${res.tracks[0].title} (${res.tracks[0].duration})\n**2:** ${res.tracks[1].title} (${res.tracks[1].duration})\n**3:** ${res.tracks[2].title} (${res.tracks[2].duration})\n**4:** ${res.tracks[3].title} (${res.tracks[3].duration})\n**5:** ${res.tracks[4].title} (${res.tracks[4].duration})`
         )
         .then(() => {
            songChoices = message.channel.lastMessage;

            client.exeCommands = false;

            const filter = (m) =>
               m.content.includes(client.prefix + (this.name || this.aliases));

            message.channel
               .awaitMessages({
                  filter,
                  maxProcessed: 1,
                  time: 10000,
                  errors: ['time'],
               })
               .then(() => {
                  message.reply('thats crazy you answered');
                  client.exeCommands = true;
               })
               .catch(() => {
                  message.reply('you took too long');
                  client.exeCommands = true;
                  setTimeout(() => {
                     songChoices.delete();
                  }, 3000);
               });
         });
   },
};
