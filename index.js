const Discord = require('discord.js'),
      dotenv = require('dotenv'),
      axios = require('axios');

dotenv.config()
const client = new Discord.Client();
client.login(process.env.TOKEN);

const broadcast = client.createVoiceBroadcast();
broadcast.playArbitraryInput(process.env.STREAM_URL, {
  volume: 0.5,
  passes: 3
});
broadcast.on('end', () => {
  broadcast.playArbitraryInput(process.env.STREAM_URL, {
    volume: 0.5,
    passes: 3
  });
})

client.on('message', async message => {
  // Voice only works in guilds, if the message does not come from a guild,
  // we ignore it
  if (!message.guild) return;
  if (message.content.indexOf(process.env.PREFIX) != 0) return;

  var command = message.content.substring(process.env.PREFIX.length);

  switch(command) {
      case 'join':
        if (message.member.voiceChannel) {
          message.react('👍')
          const connection = await message.member.voiceChannel.join();
          const dispatcher = connection.playBroadcast(broadcast);
        } else {
          message.reply('You need to join a voice channel first!');
        }
      break;
      case 'leave':
        if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
        else message.reply('Not in a channel')
      break;
      case 'invite':
        message.reply(process.env.INVITE)
      break;
      case 'help':
      case '':
        message.reply('Use `'+process.env.PREFIX+'join` and `'+process.env.PREFIX+'leave` to control the bot, `'+process.env.PREFIX+'invite` to get an invite link. Simple as that.')
      break;
      default:
        message.reply('Unknown command, try `'+process.env.PREFIX+'help`')
      break;
  }
});

client.on('voiceStateUpdate', (_, newMember) => {
  if (newMember.guild.voiceConnection && newMember.guild.voiceConnection.channel.members.size == 1) newMember.guild.voiceConnection.disconnect();
})

var updateNp = () => {
  axios.get(process.env.NP_URL).then(res => {
    client.user.setActivity(res.data.artist + ' - ' + res.data.title, {type: "LISTENING"})
  })
}
setInterval(updateNp, 3000)

process.on('SIGINT', function() {
  client.guilds.forEach(guild => {
    if (guild.voiceConnection) guild.voiceConnection.disconnect();
  })
  process.exit();
});