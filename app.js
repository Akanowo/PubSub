// jshint esversion:8
// Declarations
const express = require('express');
const http = require('http');
const faye = require('faye');
const debug = require('debug')('app:home');
const path = require('path');
const socket = require('socket.io');

const app = express();
const bayeux = new faye.NodeAdapter({ mount: '/faye', timeout: 45 });
const events = [];

// Configurations
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'node_modules')));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Events endpoints
app.get('/events', (req, res) => {
  if (!process.env.CLIENT || !process.env.CLIENTSUBSCRIPTION) {
    debug(process.env.CLIENT);
    debug(process.env.CLIENTSUBSCRIPTION);
    debug(process.env.STATUS);
    return res.json({
      status: 'unsuscribed',
      message: 'Subscribe first by making a post request to http://localhost:8080/subscribe/{TOPIC}'
    });
  }

  if (process.env.STATUS === 'subscribed') {
    return res.json({
      status: process.env.STATUS,
      userId: process.env.CLIENT,
      clientSubscription: process.env.CLIENTSUBSCRIPTION,
      publishedEvents: events
    });
  }

  if (process.env.STATUS === 'published') {
    debug('Topic: ' + process.env.TOPIC);
    return res.json({
      status: process.env.STATUS,
      userId: process.env.CLIENT,
      topic: process.env.TOPIC,
      clientSubscription: process.env.CLIENTSUBSCRIPTION,
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

  bayeux.on('subscription', function (client) {
    // Set environment variables
    process.env.CLIENT = client.trim();
    process.env.CLIENTSUBSCRIPTION = topic.trim();
    process.env.STATUS = 'subscribed';
  });


  return bayeux.getClient().subscribe(`/topic/${topic}`).then(() => {
    return res.redirect('/events');
  }).catch((err) => {
    return res.json({
      status: 'failed',
      message: 'Subscription unsuccessful',
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
  });

  // Push message to events array
  events.push({topic, event: req.body.message});

  // Send response
  return bayeux.getClient().publish(`/topic/${topic}`, { event: req.body.message }).then(() => {
    return res.redirect('/events');
  }).catch((err) => {
    return res.json({
      status: 'failed',
      message: 'Publish unsuccessful',
      error: err
    });
  });
});

// Initialize server with app
const server = http.createServer(app);

// Connect Faye with server
bayeux.attach(server);

// Connect socket.io with server
const io = socket(server);

io.on('connection', (client) => {
  debug('A user connected', client.id);

  // Listen for subscription
  bayeux.on('subscribe', (id, channel) => {
    process.env.CLIENTSUBSCRIPTION = channel;
    process.env.CLIENT = id;
    process.env.STATUS = 'subscribed';
    io.emit('subscription', {
      status: 'subscribed',
      userId: id,
      clientSubscription: channel,
      publishedEvents: events
    });
  });

  // Listen for publishing
  bayeux.on('publish', (id, channel, data) => {
    process.env.CLIENT = id;
    process.env.TOPIC = channel;
    process.env.STATUS = 'published';
    io.emit('publish', {
      status: 'published',
      userId: id,
      topic: channel,
      clientSubscription: process.env.CLIENTSUBSCRIPTION,
      data,
      publishedEvents: events
    });
    
  });
});

// Listen on port 8080
server.listen(8080, () => {
  debug('Server stared on port 8080');
});
