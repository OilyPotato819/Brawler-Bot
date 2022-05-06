module.exports = {
   name: 'hello',
   description: 'greet author of message',
   aliases: ['hi', 'hey'],
   async execute(message, args) {
      message.reply(`Hello ${message.author.username}`);
   },
};
