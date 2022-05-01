const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
   name: 'shush',
   description: 'kick target whenever they speak',
   async execute(message, args) {
      if (!args[0]) return await message.reply('include who you want to shush');

      if (args[1]) {
         return await message.reply('you can only shush one person at a time');
      }

      if (!message.mentions) {
         return message.reply(`${args[0]} is not a valid user`);
      }

      if (message.mentions.users.values().next().value.bot) {
         return message.reply("you can't shush a bot");
      }

      if (!message.member.voice.channel) {
         return message.reply('you need to be in a vc');
      }

      if (!client.shushVotes) {
         client.shushVotes = [];
      }

      function getShushVotes() {
         return client.shushVotes.find((obj) => {
            return obj.channelName === message.member.voice.channel.name && obj.target === args[0];
         });
      }

      if (!getShushVotes()) {
         client.shushVotes.push(
            (channel = {
               channelName: message.member.voice.channel.name,
               serverName: message.guild.name,
               votes: 0,
               target: args[0],
            })
         );
      }

      if (
         client.shushVotes.find((obj) => {
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

      const shushIndex = client.shushVotes.findIndex((obj) => {
         return obj.channelName === message.member.voice.channel.name;
      });

      client.shushVotes[shushIndex].votes++;

      client.shushVotes[shushIndex].voted = [message.author.id];

      const thisShushVote = getShushVotes();

      message.reply(
         `${thisShushVote.votes}/2 votes to shush ${thisShushVote.target} in ${thisShushVote.channelName}`
      );

      if (thisShushVote.votes < 2) {
         return;
      }

      client.shushVotes[shushIndex].voted = [];

      client.shushVotes[shushIndex].votes = 0;

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

         if (!connection.shushing) connection.shushing = [];

         connection.shushing.push(args[0]);

         client.connections.push(connection);
      } catch (error) {
         console.log(error);
         return message.reply('could not join vc');
      }

      message.reply(`shushing ${args[0]}`);

      const thisConnection = findConnection();

      thisConnection.receiver.speaking.on('start', (userId) => {
         if (thisConnection.shushing.includes(`<@${userId}>`)) {
            message.guild.members.cache.get(userId).voice.disconnect();
         }
      });
   },
};
