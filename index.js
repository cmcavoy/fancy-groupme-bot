const async = require('async');
const request = require('request');
const _ = require('underscore');
const events = require('events');
const util = require('util');

function Bot (config) {
  if (! (this instanceof Bot)) return new Bot(config);
  for (var key in config) if ( config.hasOwnProperty(key) )  this[key] = config[key];
  if (this.token && this.group && this.name && this.url) {
    this.registerBot();
  }
};

util.inherits(Bot, events.EventEmitter);

// register the bot with groupme, but first kill any bots in this room with this name.
Bot.prototype.registerBot = function() {
  async.waterfall([
    // get a list of the bots
    function(callback) {
      var url = 'https://api.groupme.com/v3/bots?token=' + this.token;
      request( { url : url, method : 'GET' }, function(err, response, body) {
        console.error("RESPONSE", response);
        console.error("BODY", body);
        body = JSON.parse(body);
        var botsToKill = [];
        _.each(body.response, function(bot) {
          if (bot.group_id == this.group && bot.name == this.name) {
            botsToKill.push(bot.bot_id);
            console.log(bot.bot_id + " queued for destruction");
          }
        });
        callback(null, botsToKill);
      });
    }.bind(this),

    // kill the bots
    function(botsToKill, callback) {
      var destroy = function(bot_id, destroyCallback) {
        var url = 'https://api.groupme.com/v3/bots/destroy?token=' + this.token;
        request( { url : url, method : 'POST', body : JSON.stringify({bot_id:bot_id}) },
                 function(error, response, body) {
                   destroyCallback();
                 });
      };
      async.each(botsToKill, destroy, callback);
    }.bind(this),

    // register the new bot
    function(callback) {
      var bot = {};
      bot.name = this.name;
      bot.group_id = this.group;
      bot.callback_url = this.url + '/incoming';
      var url = 'https://api.groupme.com/v3/bots?token=' + this.token;
      request( { url:url, method:'POST', body: JSON.stringify( { bot:bot } ) },
               function(error, response, body) {
                 if (!error) {
                   console.log(body);
                   var parsedBody = JSON.parse(body).response.bot;
                   callback(null, parsedBody.bot_id);
                 } else {
                   callback(error);
                 }
               }
             );
    }.bind(this)
  ], function (err, bot_id) {
    console.log("i have a bot id " + bot_id);
    this.botId = bot_id;
    this.emit('botRegistered', this);
  }.bind(this));
};

module.exports = Bot;
