const ytdl = require('ytdl-core');
const { createAudioResource, createAudioPlayer } = require('@discordjs/voice');

module.exports = {
    name: 'punch',
    description: 'Play punch sound',
    async execute(message, args) {
        if (!message.member.voice.channelId) return await message.reply('get in a vc first');

        const resource = createAudioResource(ytdl('https://youtu.be/BlgrxTVgQao', {
            filter: 'audioonly'
        }));

        player.play(resource, {
            seek: 0,
            volume: 1
        });

        connection.subscribe(player);

        player.punching = true;

        player.addListener('stateChange', () => {
            if (player.state.status === 'idle') player.punching = false;
        });
    }
}