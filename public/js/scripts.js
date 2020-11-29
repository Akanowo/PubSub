const socket = io.connect('http://localhost:8080');
const client = new Faye.Client('http://localhost:8080/faye', { timeout: 120, retry: 5 });


// Function to create publish and subscribe details container
function createContainer(userId, channel, ev) {
  // Initialize the elements
  const body = document.body;
  const container = document.createElement('div');
  const topic = document.createElement('h2');
  const usersContainer = document.createElement('div');
  const user = document.createElement('p');
  const events = document.createElement('div');
  const splitChannel = channel.split('/');

  // Set elements attributes and contents
  container.setAttribute('id', splitChannel[splitChannel.length - 1]);
  topic.setAttribute('id', 'topic');
  topic.innerHTML = splitChannel[splitChannel.length - 1];
  usersContainer.setAttribute('id', 'subscribers');
  user.innerHTML = 'User id: ' + userId;
  events.setAttribute('id', 'events');
  ev.forEach((e) => {
    const event = document.createElement('p');
    event.innerHTML = e.event;
    events.appendChild(event);
  });

  // append elements to DOM
  container.appendChild(topic);
  container.appendChild(usersContainer);
  usersContainer.appendChild(user);
  container.appendChild(events);
  body.appendChild(container);
}

// Listen for subscription
socket.on('subscription', function (data) {
  // Notify new subscription
  alert('New Subscription');

  // Get the channel from data
  const split = data.clientSubscription.split('/');
  const channel = split[split.length - 1];

  // Find channel div in th DOM
  const subscription = document.getElementById(channel);

  if(subscription) {
    // Get child nodes form the subscription container
    const subscriptionDiv = subscription.children;

    // Create a new subscriber
    const newSubscriber = document.createElement('p');
    newSubscriber.innerHTML = data.userId;

    // Find the subscribers div
    for(let i = 0; i < subscriptionDiv.length; i++) {
      if(subscriptionDiv[i].id === 'subscribers') {
        subscriptionDiv[i].appendChild(newSubscriber);
      }
    }
  } else {
    createContainer(data.userId, data.clientSubscription, data.publishedEvents);
  }
});

// Listen for publish
socket.on('publish', function (data) {
  alert('New Publish');
  console.log(data);
  // Get the channel from data
  const split = data.topic.split('/');
  const channel = split[split.length - 1].trim();

  // Find channel div in th DOM
  const subscription = document.getElementById(channel);

  if(subscription) {
    // Get child nodes form the subscription container
    const subscriptionDiv = subscription.children;

    // Create a new event
    const newEventParagraph = document.createElement('p');
    const newEvent = data.publishedEvents.find((ev) => ev.event === data.data.event);
    console.log(newEvent);

    // Set event contents
    newEventParagraph.innerHTML = newEvent.event;

    // Find the events div in the channel container
    for(let i = 0; i < subscriptionDiv.length; i++) {
      if(subscriptionDiv[i].id === 'events') {
        subscriptionDiv[i].appendChild(newEventParagraph);
      }
    }
  } else {
    alert('No subscriber for the published event. Subscribe to see the new event');
  }
});