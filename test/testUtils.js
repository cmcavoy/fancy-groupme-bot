var nock = require("nock");

const GROUPMEURL = 'https://api.groupme.com';

// nock'd out GroupMe bot API.
module.exports.nockGroupme = function nockGroupme(config) {

  // the register call
  var registerResponse = JSON.stringify(
    {
     "response": {
       "bot": {
         "bot_id": "123",
         "group_id": config.group,
         "name": config.name,
         "avatar_url": "http://i.groupme.com/123456789",
         "callback_url": config.url + "/incoming"
      }
     }
    });

  console.error(JSON.parse(registerResponse));

  nock(GROUPMEURL)
    .post("/v3/bots?token=" + config.token)
    .reply(200, registerResponse);

  // the bot list call
  nock(GROUPMEURL)
    .get("/v3/bots?token=" + config.token)
    .times(10)
    .reply(200, JSON.stringify([]));

  // delete a bot
}
