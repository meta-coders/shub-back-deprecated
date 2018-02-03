'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const dbApi = require('../lib/dbApi.js');
const auth = require('../lib/auth.js');
const sessions = require('../sessions.js');

const login = express();

login.use(bodyParser.json());
login.use(bodyParser.urlencoded({
  extended: true
}));


login.post('/', (req, res) => {
  const login = req.body.login;
  const password = req.body.password;
  dbApi.do().authenticate(login, password, (err, status) => {
    if (status) res.json({
      sessionId: auth.generateSessionId(sessions)
    });
    else res.sendStatus(403);
  });
});

module.exports = login;
