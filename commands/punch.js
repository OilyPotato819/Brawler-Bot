const { QueryType } = require('discord-player');

module.exports = {
   name: 'punch',
   description: 'Play punch sound',
   async execute(message, args) {
      const res = await player.search('https://youtu.be/BlgrxTVgQao', {
         requestedBy: message.member,
         searchEngine: QueryType.AUTO,
      });

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

      res.playlist
         ? queue.addTracks(res.tracks)
         : queue.addTrack(res.tracks[0]);

      if (!queue.playing) await queue.play();
   },
};
