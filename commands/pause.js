module.exports = {
    name: 'pause',
    description: 'pause the bot',
    async execute(message, args) {
        const player = message.guild.player;

        if (player.state.status != 'playing' || player.punching) return message.reply('there is no song to pause')

        player.pause();
        await message.reply('paused');
    }
}