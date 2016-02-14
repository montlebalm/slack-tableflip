require('dotenv').config();
var Botkit = require('botkit');
var flip = require('flip');

if (!process.env.APP_CLIENT_ID || !process.env.APP_CLIENT_SECRET || !process.env.PORT) {
  console.log('Error: Specify APP_CLIENT_ID, APP_CLIENT_SECRET, and PORT in environment');
  process.exit(1);
}

var controller = Botkit.slackbot().configureSlackApp({
  clientId: process.env.APP_CLIENT_ID,
  clientSecret: process.env.APP_CLIENT_SECRET,
  scopes: ['commands'],
});

controller.setupWebserver(process.env.PORT, function(err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver, function(err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

controller.on('slash_command', function(bot, message) {
  var flipped = flip(message.text);
  bot.replyPrivate(message, flipped);
});
