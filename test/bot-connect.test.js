var test = require("tap").test;
var nock = require("nock");
var bot = require("..");

const TOKEN = 'mytoken';
const GROUP = 123456;
const NAME = 'mytestbot';
const URL = 'http://fakecallback.com';
const CONFIG = {token:TOKEN, group:GROUP, name:NAME, url:URL};

const GROUPMEURL = 'https://api.groupme.com';

function nockGroupme() {
  // the register call
  nock(GROUPMEURL)
    .post('/v3/bots')
    .reply(JSON.stringify({
      "bot_id": "123",
      "group_id": GROUP,
      "name": NAME,
      "avatar_url": "http://i.groupme.com/123456789",
      "callback_url": URL + "/incoming"
    }));
}

test("make a bot", function(t) {
  var b = bot({});
  t.ok(b, "I created a bot with a blank configuration");
  t.end();
});

test("register a bot", function(t) {
  nockGroupme();
  var b = bot(CONFIG);
  t.equal(b.bot_id, "123");
  t.end();
});
