require('dotenv').config();
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
app.use(express.static('public'));

// Handle oauth flow
app.get('/oauth', function(req, res) {
  var url = 'https://slack.com/api/oauth.access?' + qs.stringify({
    client_id: process.env.APP_CLIENT_ID,
    client_secret: process.env.APP_CLIENT_SECRET,
    code: req.query.code,
  });
  request.post(url, function(err, http, body) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

// Respond to webhooks
app.post('/webhook', function(req, res) {
  console.log(req.body);
  if (!req.body.token === process.env.APP_COMMAND_TOKEN) return res.sendStatus(403);
  if (!req.body.command || !req.body.command.startsWith('/tableflip')) return res.sendStatus(200);

  var flipped_text = flip(req.body.text) || '┻━┻';
  var response_text =  '(╯°□°）╯︵ ' + flipped_text;

  // Send our actual response async
  request({
    body: {
      response_type: 'in_channel',
      text: response_text,
    },
    json: true,
    method: 'post',
    uri: req.body.response_url,
  });

  // Let Slack know we didn't timeout
  res.send();
});

// Serve static files off root
app.get('/', express.static(__dirname + '/public'));

var server = app.listen(process.env.PORT, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://%s:%s', host, port);
});
