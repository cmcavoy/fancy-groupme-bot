function Bot (config) {
  if (! (this instanceof Bot)) return new Bot(config);
  console.log("I am a bot");
  console.log("yum! config! " + config);
};

Bot.prototype.what = function() { console.log('say what?') };

module.exports = Bot;
