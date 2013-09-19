var test = require("tap").test;
var bot = require("..");
var nockGroupme = require('./testUtils').nockGroupme;
const CONFIG = require('./config');

test("make a bot", function(t) {
  nockGroupme(CONFIG);
  var b = bot({});
  t.ok(b, "I created a bot with a blank configuration");
  t.end();
});

test("register a bot", function(t) {
  nockGroupme(CONFIG);
  var b = bot(CONFIG);
  b.on('botRegistered', function(bot) {
    t.equal(bot.botId, "123");
    t.end();
  });
});
