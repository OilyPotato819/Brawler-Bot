module.exports = {
    name: 'greeting',
    description: 'greet author of message',
    async execute(message, args) {
        message.reply(`Hello ${message.author.username}`)
    }
}