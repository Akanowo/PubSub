# PUBLISH/SUBSCRIBE SYSTEM

# Introduction
This API system was built using the Express framework of Node.js.

# Requirement
Make sure Node.js is installed on your computer. Download it here: https://nodejs.org/en/download/

# Installation
1. Clone the repository to your system.
2. Open your terminal and change directory to the cloned folder.
3. Run 'npm install'.
4. To start the application run 'npm start'

# API DOCS
### Create a subscription
1. Head over to http://locahost:8080
2. Make a post request using Curl or Postman to /subscribe/{TOPIC} with {url:"http://localhost:8080/events"} as the body of the request.
3. You can head over to http://localhost:8080/events on a seperate tab to verify your subscription was successful.

### Publish a message.
1.Make a post request using Curl or Postman to /publish/{TOPIC} with a JSON body of {"message": "Write a message here"}.
2. You can head over to http://localhost:8080/events on a seperate tab to verify the publishing was successful.


NOTE: http://locahost:8080 is used to see a real-time update of your activities.
