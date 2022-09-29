const { joinVoiceChannel } = require('@discordjs/voice');
const prism = require('prism-media');

module.exports = {
   name: 'silence',
   description: 'kick target whenever they speak',
   silenceVotes: [],
   async execute(message, args) {
      if (!args[0]) return await message.reply('include who you want to silence');

      const userMentioned = message.mentions.users.values().next().value;

      if (!message.mentions || !userMentioned) {
         return message.reply(`${args[0]} is not a valid user`);
      }

      if (!message.member.voice.channel) {
         return message.reply('you need to be in a vc');
      }

      // if (message.author.id === '664646572566511653') {
      //    return message.reply('no shut up michael');
      // }

      // if (message.author.id === '465298168675041300') {
      //    return message.reply('no shut up xander');
      // }

      if (userMentioned.id === client.user.id) {
         args[0] = `<@${message.author.id}>`;

         message.reply('you dare attempt to silence me?');

         connect();
      } else if (userMentioned.bot) {
         return message.reply("you can't silence a bot");
      } else {
         voteHandler();
      }

      function voteHandler() {
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
            `${thisSilenceVote.votes}/2 votes to silence ${thisSilenceVote.target} in ${thisSilenceVote.channelName}`
         );

         if (thisSilenceVote.votes < 2) {
            return;
         }

         client.silenceVotes.splice(silenceIndex, 1);

         connect();
      }

      function connect() {
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

         function subscribe(userId, guildId) {
            let audio = bot1Bot.connection.receiver.subscribe(userId);

            const opusDecoder = new prism.opus.Decoder({
               frameSize: 960,
               channels: 2,
               rate: 48000,
            });

            audio.pipe(opusDecoder);

            opusDecoder.on('data', (chunk) => {
               const wordAmount = Buffer.byteLength(chunk) / 2;

               let chunkIndex = 0;
               for (let word = 0; word < wordAmount; word++, chunkIndex += 2) {
                  const hex0 = chunk[0 + chunkIndex].toString(16).padStart(2, '0');
                  const hex1 = chunk[1 + chunkIndex].toString(16).padStart(2, '0');

                  const hex = `0x${hex1}${hex0}`;
                  const amplitude = +hex > 0x7fff ? +hex - 0x10000 : +hex;

                  const limit = 26 * 1000;
                  if (amplitude > limit || amplitude < -limit) {
                     opusDecoder.destroy();
                     const guild = bot1Bot.client.guilds.cache.get(guildId);
                     return guild.members.cache.get(userId).voice.disconnect();
                  }
               }
            });
         }

         if (!bot1Bot.connection) return;

         const subscriptions = bot1Bot.connection.receiver.subscriptions;

         if (newState.id === bot1Bot.client.user.id) {
            subscribe(targetId, newState.guild.id);
            //    newState.channel.members.forEach((member) => {
            //       // if (member.user.bot) return;
            //       if (member.id === bot1Bot.client.user.id) return;

            //       subscribe(member.user.id, newState.guild.id);
            //    });
         } else if (
            newState.channelId === bot1Bot.voiceId &&
            !newState.member.user.bot &&
            newState.member.user.id == targetId
         ) {
            subscribe(newState.member.id, newState.guild.id);
         } else if (
            subscriptions.size > 0 &&
            oldState.channelId === bot1Bot.voiceId &&
            newState.channelId != bot1Bot.voiceId
         ) {
            subscriptions.get(newState.member.id).destroy();
         }
      }
   },
};
