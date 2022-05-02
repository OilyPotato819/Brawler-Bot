module.exports = {
   name: 'cancelvote',
   description: 'cancel your vote for silence or unsilence',
   async execute(message, args) {
      if (!client.silenceVotes) return message.reply("you don't have any votes");

      const voteIndex = client.silenceVotes.findIndex((obj) => {
         return (
            obj.voted &&
            obj.voted.includes(message.author.id) &&
            obj.serverName === message.guild.name
         );
      });

      client.silenceVotes[voteIndex].votes--;

      const thisSilenceVote = client.silenceVotes[voteIndex];

      const votedIndex = thisSilenceVote.voted.findIndex((obj) => {
         return obj.includes(message.author.id);
      });

      client.silenceVotes[voteIndex].voted.splice(votedIndex);

      message.reply(
         `${thisSilenceVote.votes}/2 votes to silence ${thisSilenceVote.target} in ${thisSilenceVote.channelName}`
      );
   },
};
