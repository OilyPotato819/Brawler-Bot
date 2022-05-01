module.exports = {
   name: 'cancelvote',
   description: 'cancel your vote for shush or unshush',
   async execute(message, args) {
      if (!client.shushVotes) return message.reply("you don't have any votes");

      const voteIndex = client.shushVotes.findIndex((obj) => {
         return (
            obj.voted &&
            obj.voted.includes(message.author.id) &&
            obj.serverName === message.guild.name
         );
      });

      client.shushVotes[voteIndex].votes--;

      const thisShushVote = client.shushVotes[voteIndex];

      const votedIndex = thisShushVote.voted.findIndex((obj) => {
         return obj.includes(message.author.id);
      });

      client.shushVotes[voteIndex].voted.splice(votedIndex);

      message.reply(
         `${thisShushVote.votes}/2 votes to shush ${thisShushVote.target} in ${thisShushVote.channelName}`
      );
   },
};
