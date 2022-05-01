module.exports = {
   name: 'unshush',
   description: 'unshush member',
   async execute(message, args) {
      const thisConnection = client.connections.find((obj) => {
         return obj.serverName === message.guild.name;
      });

      if (!thisConnection || !thisConnection.shushing) {
         return message.reply('no one is being shushed rn');
      }

      if (!args[0]) return message.reply('include who you want to shush');

      if (thisConnection.shushing.includes(`<@${message.author.id}>`)) {
         return message.reply("lol you can't unshush yourself");
      }

      for (let i = 0; i < args.length; i++) {
         let id = args[0].replace(/[^0-9]/g, '');

         if (
            !id ||
            !args[i].startsWith('<@') ||
            !args[i].endsWith('>') ||
            !message.guild.members.cache.get(id) ||
            message.guild.members.cache.get(id).user.bot
         ) {
            return message.reply(`${args[i]} is not a valid user`);
         }

         const indexOfTarget = thisConnection.shushing.indexOf(args[i]);

         thisConnection.shushing.splice(indexOfTarget);

         return message.reply(`unshushed ${args[i]}`);
      }
   },
};
