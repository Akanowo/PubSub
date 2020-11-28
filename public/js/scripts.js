const socket = io.connect('http://localhost:8080');
const client = new Faye.Client('http://localhost:8080/faye', { timeout: 120, retry: 5 });
const header = document.getElementById('header');
const users = document.getElementById('users');
const messages = document.getElementById('messages');



// Listen for subscription
socket.on('subscription', function (data) {
  const id = document.createElement('p');
  const channel = document.createElement('p');
  const publishing = document.createElement('div');


  alert('New Subscription');

  id.innerHTML = 'User id: ' + data.userId;
  const split = data.clientSubscription.split('/');
  channel.innerHTML = 'Topic: ' + split[split.length - 1];
  publishing.setAttribute('class', split[split.length - 1]);
  const newArr = data.publishedEvents.filter((x) => x.topic === split[split.length -1]);
  console.log('Subscription Array', newArr);
  users.appendChild(id);
  users.appendChild(channel);
  users.appendChild(publishing);

  // Check if events exists and render it
  const events = document.getElementsByClassName(split[split.length - 1]);
  console.log('Events: ');
  console.log(events);
  for (let i = 0; i < events.length; i++) {
    for(let j =0; j < newArr.length; j++) {
      const p = document.createElement('p');
      p.innerHTML = newArr[j].event;
      events[i].appendChild(p);
    }
  }
});

// Listen for publish
socket.on('publish', function (data) {
  alert('New Publish');
  console.log(data);
  const clientSubscription = data.clientSubscription.split('/');
  const topic = data.topic.split('/');

  if(!clientSubscription) {
    alert('Please Subscribe to a topic to view');
  }


  // Filter publishedArray with the user's topic subscription
  const newArr = data.publishedEvents.filter((x) => x.topic === topic[topic.length - 1]);
  const events = document.getElementsByClassName(topic[topic.length - 1]);
  for (let i = 0; i < events.length; i++) {
    const p = document.createElement('p');
    const item = newArr.find((x) => x.event === data.data.event);
    if(!item) {
      p.innerHTML = '';
    } else {
      p.innerHTML = item.event;
      events[i].appendChild(p);
    }
  }
});



// client.subscribe('/topic/topic2', function(message) {
//   console.log(message);
//   header.innerHTML = message.topic;
//   const p = document.createElement('p');
//   p.innerHTML = message.text;
//   document.getElementById('messages').append(p);
// }).then((sub) => {
//   console.log(`Subscription successful!`);
// });

// client.subscribe('/topic/topic1', function(message) {
//   console.log(message);
//   header.innerHTML = message.topic;
//   const p = document.createElement('p');
//   p.innerHTML = message.text;
//   document.getElementById('messages').append(p);
// }).then((sub) => {
//   console.log(`Subscription successful!`);
// });
