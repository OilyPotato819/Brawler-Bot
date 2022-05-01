const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
   name: 'shush',
   description: 'kick target whenever they speak',
   async execute(message, args) {
      if (!args[0]) return await message.reply('include who you want to shush');

      for (let i = 0; i < args.length; i++) {
         let id = args[0].replace(/[^0-9]/g, '');

         if (
            !args[i].startsWith('<') ||
            message.guild.members.cache.get(id).user.bot
         ) {
            return message.reply(`${args[i]} is not a valid user`);
         }
      }

      const connection = joinVoiceChannel({
         channelId: message.member.voice.channel.id,
         guildId: message.channel.guild.id,
         adapterCreator: message.channel.guild.voiceAdapterCreator,
         selfDeaf: false,
      });

      connection.receiver.speaking.on('start', (userId) => {
         if (args.includes(`<@${userId}>`)) {
            const member = message.guild.members.cache.get(userId);

            if (!member.kickable) message.reply('user is not kickable');

            member.kick();
         }
      });
   },
};
