const client = new Faye.Client('http://localhost:8080/faye', { timeout: 120, retry: 5 });
const header = document.getElementById('header');
const messages = document.getElementById('messages');

// Subscribe to topic a using AJAX
async function subscribe() {
  return $.ajax({
    url: '/subscribe/topic1',
    method: 'POST',
    data: { url: 'http://localhost:8080/events' },
    success: (response) => {
      header.innerHTML = response.topic;
      response.publishedEvents.forEach((ev) => {
        const p = document.createElement('p');
        p.innerHTML = ev;
        messages.appendChild(p);
      });

      client.subscribe(`/topic/${response.topic}`, function (msgs) {
        const p = document.createElement('p');
        p.innerHTML = msgs[msgs.length - 1];
        messages.appendChild(p);
      });
    },
    error: (err) => {
      console.log(err);
    }
  });
}

subscribe();



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
