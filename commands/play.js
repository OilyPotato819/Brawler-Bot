const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { createAudioResource, createAudioPlayer } = require('@discordjs/voice');

module.exports = {
    name: 'play',
    description: 'Joins and plays a video from youtube',
    async execute(message, args, connection) {
        const query = args.join(' ');

        if (!message.member.voice.channelId) return await message.reply('get in a vc first');
        if (!query) return await message.reply('include what you want to play');
        if (!message.guild.player) message.guild.player = createAudioPlayer();

        const player = message.guild.player;
        
        const validURL = (str) => {
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if (!regex.test(str)) {
                return false;
            } else {
                return true;
            }
        }

        if (validURL(query)) {
            const getTitle = ytdl.getBasicInfo(query).then(info => {
                return info.videoDetails.title;
            })

            const videoTitle = await getTitle;
            play(query, videoTitle);
        } else {
            const querySearch = await ytSearch(query);

            const videos = querySearch.videos.slice(0, 1)
            videos.forEach(function (v) {
                play(v.url, v.title);
            });
        }

        async function play(link, title) {
            const resource = createAudioResource(ytdl(link, {
                filter: 'audioonly'
            }));

            player.play(resource, {
                seek: 0,
                volume: 1
            });

            connection.subscribe(player);

            await message.reply(`now playing **${title}**`);
        }
    }
}