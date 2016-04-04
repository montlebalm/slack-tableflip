if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

var body_parser = require('body-parser');
var express = require('express');
var flip = require('flip');
var qs = require('qs');
var request = require('request');

if (!process.env.APP_CLIENT_ID || !process.env.APP_CLIENT_SECRET || !process.env.PORT) {
  console.log('Error: Specify APP_CLIENT_ID, APP_CLIENT_SECRET, and PORT in environment');
  process.exit(1);
}

var app = express();
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

// Handle oauth flow
app.get('/oauth', function(req, res) {
  var url = 'https://slack.com/api/oauth.access?' + qs.stringify({
    client_id: process.env.APP_CLIENT_ID,
    client_secret: process.env.APP_CLIENT_SECRET,
    code: req.query.code,
  });

  request.post(url, function(err, http, body) {
    var info = JSON.parse(body);

    if (info.ok && info.access_token) {
      res.redirect(process.env.OAUTH_SUCCESS_URL);
    } else {
      console.log('error:', err, body);
      res.redirect(process.env.OAUTH_ERROR_URL);
    }
  });
});

// Respond to webhooks
app.post('/command/tableflip', function(req, res) {
  if (req.body.token === process.env.APP_COMMAND_TOKEN) return res.sendStatus(403);
  if (!req.body.command.startsWith('/tableflip')) return res.sendStatus(200);

  var flipped_text = flip(req.body.text) || '┻━┻';
  var response_text =  '(╯°□°）╯︵ ' + flipped_text;

  res.json({
    response_type: 'in_channel',
    text: response_text,
  });
});

// Leave a route for us to use as a monitor
app.get('/ping', function(req, res) {
  res.sendStatus(200);
});

app.listen(process.env.PORT, function() {
  console.log('Server listening on', process.env.PORT);
});
