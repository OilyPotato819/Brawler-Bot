const { VoiceConnection } = require("@discordjs/voice");

module.exports = {
    name: 'leave',
    description: 'leave the call',
    async execute(message, connection) {
        const player = message.guild.player;

        if (player.state.status) return message.reply('there is no song to unpause')

        player.stop();
        connection.unsubscribe();
        await message.reply('no mo :(');
    }
}