const cheerio = require('cheerio');
const axios = require('axios');

module.exports = {
   name: 'checkcage',
   description: "checks user's use of goblin cage card",
   async execute(message, args) {
      try {
         const { data } = await axios.get(
            'https://royaleapi.com/player/2PLLRPJ9L/analytics?time=14d'
         );

         const $ = cheerio.load(data);

         const usage = $('td[data-sort-value="goblin-cage"]').siblings().eq(1).html().trim();

         return message.reply(`you have used goblin cage ${usage} games in the past 14 days`);
      } catch (err) {
         console.error(err);
      }
   },
};
