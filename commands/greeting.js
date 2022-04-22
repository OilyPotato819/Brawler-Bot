module.exports = {
    name: 'greeting',
    description: 'greet author of message',
    async execute(message) {
        message.reply(`Hello ${message.author.username}`)
    }
}