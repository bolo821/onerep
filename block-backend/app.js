const dotenv = require("dotenv");
const https = require('https');
const fs = require("fs");
const cors = require("cors");
const express = require("express");
const app = express();
const auth = require('./src/config/passport')();
const passport = require("passport");
const bodyParser = require('body-parser');
const mongoose = require('./src/db/connection');
const User = require("./src/models/user");
const http = require('http');
const localStrategy = require("passport-local");

dotenv.config();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//passport middleware
app.use(auth.initialize());

app.use(express.static('public'));

//passport config
passport.use(new localStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());


global.__basedir = __dirname;

var corsOptions = {
  origin: "*"
}
const whitelist = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://localhost:3000',
  'https://localhost:5000',
  "http://onerep.uniblocks.net",
  "http://onerep.uniblocks.net:5000",
  "https://onerep.uniblocks.net",
  "https://onerep.uniblocks.net:5000"
]
if (!process.env.TEST_MODE - 0) {
  corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }
}

app.use(cors(corsOptions));

const initRoutes = require("./src/routes");
initRoutes(app);

let port = process.env.PORT || 3001;
console.log("ENV.PORT=", port);

var privateKey = fs.readFileSync('privkey.pem');
var certificate = fs.readFileSync('cert.pem');
var sa = fs.readFileSync('chain.pem');

if (process.env.HTTPS - 0) {
  // HTTPS
  https.createServer({
    key: privateKey,
    cert: certificate
  }, app).listen(port, err => {
    if (err) {
      console.log("Failed to start server", err);
    } else {
      console.log("Server started at port", port, "with https successfully")
    }
  });
} else {
  // HTTP
  app.listen(port, err => {
    if (err) {
      console.log("Failed to start server", err);
    } else {
      console.log("Server started at port", port, "with http successfully")
    }
  });
}
