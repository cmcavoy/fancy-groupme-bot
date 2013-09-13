var bot = require('fancy-groupme-bot');

// local configuration read from env.
const TOKEN = process.env['TOKEN'];
const GROUP = process.env['GROUP'];
const NAME = process.env['NAME'];
const URL = process.env['URL'];
const CONFIG = {token:TOKEN, group:GROUP, name:NAME, url:URL};

var mybot = bot(CONFIG);

mybot.on('botRegistered', function(b) {
  console.log("I am registered");
  console.log("my id " + b.botId);
  console.log("my room " + b.group);
  console.log("my token " + b.token);
  b.message("WHAT UP BRO? " + b.botId);
});

module.exports = mybot;
