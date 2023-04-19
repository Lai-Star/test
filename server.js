require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const request = require('request');
const bodyParser = require('body-parser');
const { transporter, mailOptions } = require('./emailConfig');

const app = express();

let userProfiles = [];
let users = [];

let pendingRequests = []

app.use(bodyParser());
app.use(morgan());

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
  fetchData();
});

// submit
app.post('/', (req, res) => {
  console.log(req.body);
  const searchResult = searchEngine(req.body.userid, req.body.wish);
  if (searchResult == 0) {
    console.log('no match');
    res.status(400).send('Error: User not registered or more than 10 years old');
  } else {
    pendingRequests = [...pendingRequests, searchResult];
    console.log(pendingRequests);
    res.status(200).send('Request received');
  }
  return;
});

// fetch Data from json files with userprofiles and users
const fetchData = () => {
  request.get('https://raw.githubusercontent.com/alj-devops/santa-data/master/userProfiles.json',(err, result, body) => {
    if(err || result.statusCode != 200) {
      console.error("Failed to fetch userProfiles data", err || result.statusMessage);
      return;
    }
    userProfiles = JSON.parse(body);

    request.get("https://raw.githubusercontent.com/alj-devops/santa-data/master/users.json", (err, result, body) => {
      if(err || result.statusCode != 200) {
        console.error("Failed to fetch users data", err || result.statusMessage);
        return;
      }
      users = JSON.parse(body);
    })
  })
}

// Filter User
const searchEngine = (userid, maintext) => {
  const res = userProfiles.filter(item1 => {
    return users.some(item2 => {
      const birthday = new Date(item1.birthdate);
      const age = getAge(birthday);
      return item2.uid == item1.userUid && item2.username == userid && age < 10;
    });
  });
  if (res.length === 0) return 0;
  else return { ...res[0], userid, maintext };
}

// Caculate selected children's age
const getAge = (birthday) => {
  const now = new Date();
  const ageInMilliseconds = now - birthday;
  return ageInMilliseconds / 1000 / 60 / 60 / 24 / 365.25;
}

// function to send mail with information on pending request
const sendEmail = () => {
  let bodyText = "Send Email";
  pendingRequests.forEach(request => {
    console.log(request);
    bodyText += `Child Name: ${request.userid}`;
    bodyText += `Child Address: ${request.address}`;
    bodyText += `Main Text: ${request.maintext}`
  });
  mailOptions.text = bodyText;
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Failed to send email", error);
    } else {
      console.log(`Email Sent: ${info.response}`);
      pendingRequests.length = 0;
      fetchData();
    }
  })
}

// Schedule the email to be sent every 15s
setInterval(sendEmail, 15000);

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
