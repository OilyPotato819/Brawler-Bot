module.exports = {
    name: 'unpause',
    description: 'unpause the bot',
    async execute(message, args) {
        const player = message.guild.player;

        if (player.state.status != 'paused') return message.reply('there is no song to unpause')

        player.unpause();
        await message.reply('unpaused');
    }
}