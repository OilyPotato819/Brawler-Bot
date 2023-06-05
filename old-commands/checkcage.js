const cheerio = require('cheerio');
const axios = require('axios');

module.exports = {
   name: 'checkcage',
   description: "checks user's use of goblin cage card",
   async execute(message, args) {
      if (!args[0]) return message.reply('include what you username or tag is stupid');
      try {
         const searchPage = await axios.get(
            `https://royaleapi.com/player/search/results?q=${args[0]}`
         );

         const cheerioS = cheerio.load(searchPage.data);

         const result = cheerioS('.player_tag').html();

         if (!result) return message.reply(`could not find ${args[0]}`);

         const playerTag = result.replace('#', '');

         const analyticsPage = await axios.get(
            `https://royaleapi.com/player/${playerTag}/analytics?time=14d`
         );

         const cheerioA = cheerio.load(analyticsPage.data);

         const usage = cheerioA('td[data-sort-value="goblin-cage"]').siblings().eq(1).html().trim();

         console.log(`https://royaleapi.com/player/${playerTag}/cards/levels`);

         const levelsPage = await axios.get(
            `https://royaleapi.com/player/${playerTag}/cards/levels`
         );

         const cheerioL = cheerio.load(levelsPage.data);

         const level = cheerioL;

         // console.log(level.html());

         // return message.reply(`you have only used goblin cage ${usage} games in the past 14 days`);
      } catch (err) {
         console.error(err);
      }
   },
};
