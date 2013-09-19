# Fancy Groupme Bot

[Groupme Bot API](https://dev.groupme.com/tutorials/bots) wrapper. Bot making should be fun and quick and Node.

[![Build Status](https://travis-ci.org/cmcavoy/fancy-groupme-bot.png)](https://travis-ci.org/cmcavoy/fancy-groupme-bot)

[![npm stats](https://nodei.co/npm/fancy-groupme-bot.png?stars&downloads)](https://nodei.co/npm/fancy-groupme-bot.png?stars&downloads)

## Make a bot

First, add `fancy-groupme-bot` to your project.

`npm install fancy-groupme-bot`

Your bot needs a few things, a name, a room to connect to, a Groupme Token (you need to [create an application](https://dev.groupme.com/applications/new) to get a token), and an optional callback url where messages from the room will be passed. The callback url is the server your bot creates with the `serve` method. If your bot is running at `http://yourserver.com:3000` that's the url you pass. Pass the information to your bot,

```
var botConfig = { token:'my groupme token',
                  group:'room id',
                  name:'My Bot',
                  url:'a callback url' };
var bot = require('fancy-groupme-bot');
var myBot = bot(botConfig);
```

When you create the bot, it will register itself with Groupme. It also checks to see if you've registered a bot with the same name, in the same room. If you have, it will tell Groupme to unregister those bots.

Your bot fires two events, `botRegistered` and `botMessage`, they do pretty much what you'd expect them to do. Both events pass the bot itself as the first argument to the event handler. `botMessage` receives the message as the second argument. The message is an object with two properties `message.name` and `message.text`. `message.name` is the name of the user that sent the message, and `message.text` is the text of the message. In the current version of the `fancy-groupme-bot`, messages sent by your bot will also fire the `botMessage` event, so it's important to filter on `message.name` so you don't create some sort of wild endless loop. When a message comes from your bot, `message.name` will be set to whatever you set your config `name` to on bot instantiation.

Your bot can send a message to the room it's in with the `message` method. The message will be sent to the room your bot is attached to. The `message` method takes a single argument, the message you want to send. It doesn't accept a callback - it's pretty much fire and forget.

If you've configured your bot to receive messages, you'll want to start the bot server `myBot.server(port)` where `port` is the port you want the application to listen to. Groupme needs to access that address via the `url` callback you configured, so you'll need to run the bot in a publicly accessible place.

### bot.message
```
bot.message("Hi, I'm a robot, this message will appear in the Groupme room I was configured to attach myself to!");
```

### botRegistered event
```
myBot.on('botRegistered', function(bot) {
  console.log('I am registered');
  }
);
```

### botMessage event
```
myBot.on('botMessage', function(bot, message) {
  console.log(message.name + " said " + message.text);
  }
);
```

## Example

This bot connects to a room and repeats whatever was said.

```
var bot = require('fancy-groupme-bot');
var util = require('util');

// local configuration read from env.
const TOKEN = process.env['TOKEN']; // your groupme api token
const GROUP = process.env['GROUP']; // the room you want to join
const NAME = process.env['NAME']; // the name of your bot
const URL = process.env['URL']; // the domain you're serving from, should be accessible by Groupme.
const CONFIG = {token:TOKEN, group:GROUP, name:NAME, url:URL};

var mybot = bot(CONFIG);

mybot.on('botRegistered', function(b) {
  console.log("I am registered");
  b.message("WHAT UP BRO?");
});

mybot.on('botMessage', function(b, message) {
  console.log("I got a message, fyi");
  if (message.name != b.name) {
    b.message(message.name + " said " + message.text);
  }
});

console.log("i am serving");
mybot.serve(8000);
```
