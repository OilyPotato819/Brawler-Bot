const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
   name: 'silence',
   description: 'kick target whenever they speak',
   async execute(message, args) {
      if (!args[0]) return await message.reply('include who you want to silence');

      if (args[1]) {
         return await message.reply('you can only silence one person at a time');
      }

      const userMentioned = message.mentions.users.values().next().value;

      if (!message.mentions || !userMentioned) {
         return message.reply(`${args[0]} is not a valid user`);
      }

      if (!message.member.voice.channel) {
         return message.reply('you need to be in a vc');
      }

      if (message.author.id === '664646572566511653') {
         return message.reply('no shut up michael');
      }

      if (message.author.id === '465298168675041300') {
         return message.reply('no shut up xander');
      }

      if (userMentioned.id === client.user.id) {
         args[0] = `<@${message.author.id}>`;

         message.reply('you dare attempt to silence me?');
      } else if (userMentioned.bot) {
         voteHandler();

         return message.reply("you can't silence a bot");
      }

      function voteHandler() {
         if (!client.silenceVotes) {
            client.silenceVotes = [];
         }

         function getSilenceVotes() {
            return client.silenceVotes.find((obj) => {
               return (
                  obj.channelName === message.member.voice.channel.name && obj.target === args[0]
               );
            });
         }

         if (!getSilenceVotes()) {
            client.silenceVotes.push(
               (channel = {
                  channelName: message.member.voice.channel.name,
                  serverName: message.guild.name,
                  votes: 0,
                  target: args[0],
               })
            );
         }

         if (
            client.silenceVotes.find((obj) => {
               return (
                  obj.voted &&
                  obj.voted.includes(message.author.id) &&
                  obj.serverName === message.guild.name
               );
            })
         ) {
            return message.reply(
               'you have already have a vote. if you want to vote for something else use the !cancelvote command'
            );
         }

         const silenceIndex = client.silenceVotes.findIndex((obj) => {
            return obj.channelName === message.member.voice.channel.name;
         });

         client.silenceVotes[silenceIndex].votes++;

         client.silenceVotes[silenceIndex].voted = [message.author.id];

         const thisSilenceVote = getSilenceVotes();

         message.reply(
            `${thisSilenceVote.votes}/1 votes to silence ${thisSilenceVote.target} in ${thisSilenceVote.channelName}`
         );

         if (thisSilenceVote.votes < 1) {
            return;
         }

         client.silenceVotes.splice(silenceIndex);
      }

      function findConnection() {
         return client.connections.find((obj) => {
            return obj.serverName === message.guild.name;
         });
      }

      try {
         let connection = findConnection();

         if (!connection) {
            connection = joinVoiceChannel({
               channelId: message.member.voice.channel.id,
               guildId: message.channel.guild.id,
               adapterCreator: message.channel.guild.voiceAdapterCreator,
               selfDeaf: false,
            });

            connection.serverName = message.guild.name;
         }

         if (!connection.silencing) connection.silencing = [];

         connection.silencing.push(args[0].replace(/<|@|>/g, ''));

         client.connections.push(connection);
      } catch (error) {
         console.log(error);
         return message.reply('could not join vc');
      }

      message.reply(`silencing ${args[0]}`);

      const thisConnection = findConnection();

      thisConnection.receiver.speaking.on('start', (userId) => {
         if (thisConnection.silencing.includes(`${userId}`)) {
            message.guild.members.cache.get(userId).voice.disconnect();
         }
      });
   },
};
