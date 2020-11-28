// jshint esversion:8
// Declarations
const express = require('express');
const http = require('http');
const faye = require('faye');
const debug = require('debug')('app:home');
const path = require('path');

const app = express();
const bayeux = new faye.NodeAdapter({ mount: '/faye', timeout: 45 });
const events = [];

// Configurations
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/js', express.static(path.join(__dirname, 'node_modules')));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Events endpoints
app.get('/events', (req, res) => {
  if (!process.env.CLIENT || !process.env.TOPIC) {
    return res.json({
      status: 'unsuscribed',
      message: 'Subscribe first by making a post request to http://localhost:8080/subscribe/{TOPIC}'
    });
  }

  if (process.env.STATUS === 'subscribed') {
    return res.json({
      status: process.env.STATUS,
      userId: process.env.CLIENT,
      topic: process.env.TOPIC,
      publishedEvents: events
    });
  }

  if (process.env.STATUS === 'published') {
    return res.json({
      status: process.env.STATUS,
      userId: process.env.CLIENT,
      topic: process.env.TOPIC,
      publishedEvents: events
    });
  }
});

// Subscribe endpoint
app.post('/subscribe/:topic', (req, res) => {
  const { url } = req.body;
  const { topic } = req.params;

  // Validate incoming request
  if (!url) {
    return res.status(400).json({
      status: 'failed',
      error: 'No url provided'
    });
  }

  if (url != 'http://localhost:8080/events') {
    return res.status(400).json({
      status: 'failed',
      error: 'url must match http://locahost:8080/events'
    });
  }

  // Listen for subscription
  bayeux.on('subscribe', function (client) {
    debug('Client: ' + client);
    // Set environment variables
    process.env.CLIENT = client;
    process.env.TOPIC = topic;
    process.env.STATUS = 'subscribed';
  });

  return bayeux.getClient().subscribe(`/topic/${topic}`)
    .then(() => {
      return res.redirect('/events');
    }).catch((err) => {
      return res.status(400).json({
        status: 'failed',
        error: err
      });
    });
});

// Publish endpoint
app.post('/publish/:topic', (req, res) => {
  const { topic } = req.params;

  // Validate incoming request
  if (!req.body.message) {
    return res.status(400).json({
      status: 'failed',
      error: 'Request must have a message propery'
    });
  }

  // Listen for publishing
  bayeux.on('publish', () => {
    process.env.STATUS = 'published';
    process.env.TOPIC = topic;
  });

  // Push message to events array
  events.push(req.body.message);

  // Send response
  return bayeux.getClient().publish(`/topic/${topic}`, events).then(() => {
    return res.redirect('/events');
  }).catch((err) => {
    res.json({
      status: 'Failed',
      error: err
    });
  });
});

// Initialize server with app
const server = http.createServer(app);

// Connect Faye with server
bayeux.attach(server);

// Listen on port 8080
server.listen(8080, () => {
  debug('Server stared on port 8080');
});
