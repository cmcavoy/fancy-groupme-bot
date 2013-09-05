const _ = require('underscore');
const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const server = http.createServer(app);
const request = require('request');
const async = require('async');

// DB stuff
const MemDOWN = require('memdown');
const levelup = require('levelup');
var factory  = function(location) { return new MemDOWN(location) };
const db = levelup('/whatever', { db: factory});

// local configuration
const TOKEN = process.env['TOKEN'];
const GROUP = process.env['GROUP'];
const NAME = process.env['NAME'];
const URL = process.env['URL'];

// check the db for the BOT ID from Groupme
db.get('bot_id', function(err, value) {
  if (err) console.log("db doesn't have the bot_id " + err);
  registerBot();
});

// no server side templates for now.

// middleware
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.bodyParser());

// show me the bot id
app.get('/', function(req, res, next) {
  db.get('bot_id', function(err, value) {
    if (err) {
      res.send(500, "no bot id " + err);
    } else {
      res.send(200, "BOT ID " + value);
    }
  });
});


// say hello
app.get('/hello', function(req, res, next) {
  botMessage("WHAT UP?");
  res.send(200, "I guess I did it...who knows");
});

// recieve messages
app.post('/incoming', function(req, res, next) {
  var name = req.body.name;
  var text = req.body.text;
  //var message = name + " said " + text + " BADGES!!!! AAAAAWWWW YEAH!";
  message = "AWWW YEAH BADGES!";
  console.log(message);
  if (name != NAME) {
    if (text.indexOf("BADGES") >= 0) {
      botMessage(message);
    }
  }
  res.send(200, "hey, thanks");
});

// send a message
var botMessage = function (message) {
  var url = 'https://api.groupme.com/v3/bots/post';
  var package = {};
  package.text = message;
  db.get('bot_id', function(err, value) {
    package.bot_id = value;
    request( { url:url, method:'POST', body: JSON.stringify(package) });
  });
};

// register the bot with groupme, but first kill any bots in this room with this name.
var registerBot = function() {
  async.waterfall([
    // get a list of the bots
    function(callback) {
      var url = 'https://api.groupme.com/v3/bots?token=' + TOKEN;
      request( { url : url, method : 'GET' }, function(err, response, body) {
        body = JSON.parse(body);
        var botsToKill = [];
        _.each(body.response, function(bot) {
          if (bot.group_id == GROUP && bot.name == NAME) {
            botsToKill.push(bot.bot_id);
            console.log(bot.bot_id + " queued for destruction");
          }
        });
        callback(null, botsToKill);
      });
    },

    // kill the bots
    function(botsToKill, callback) {
      var destroy = function(bot_id, destroyCallback) {
        console.log(bot_id + " being destroyed");
        var url = 'https://api.groupme.com/v3/bots/destroy?token=' + TOKEN;
        request( { url : url, method : 'POST', body : JSON.stringify({bot_id:bot_id}) },
                 function(error, response, body) {
                   console.log(body);
                   destroyCallback();
                 });
      };
      async.each(botsToKill, destroy, callback);
    },

    // register the new bot
    function(callback) {
      console.log("registering the bot");
      var bot = {};
      bot.name = NAME;
      bot.group_id = GROUP;
      bot.callback_url = URL + '/incoming';
      var url = 'https://api.groupme.com/v3/bots?token=' + TOKEN;
      request( { url:url, method:'POST', body: JSON.stringify( { bot:bot } ) },
               function(error, response, body) {
                 if (!error) {
                   console.log(body);
                   var parsedBody = JSON.parse(body).response.bot;
                   console.log(parsedBody);
                   console.log(parsedBody.bot_id);
                   callback(null, parsedBody.bot_id);
                 } else {
                   callback(error);
                 }
               }
             );
    }
  ], function (err, bot_id) {
    db.put('bot_id', bot_id);
  });
};

var port = process.env.PORT || 3000;

server.listen(port, function(err) {
  if (err) throw err;
  console.log("Listening on port " + port + ".");
});
