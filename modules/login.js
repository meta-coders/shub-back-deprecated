'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const dbApi = require('../lib/dbApi.js');

const login = express();

login.use(bodyParser.json());
login.use(bodyParser.urlencoded({
  extended: true
}));


login.post('/login', (req, res) => {
  console.log('login');
  const login = req.body.login;
  const password = req.body.password;
  dbApi.authenticate(login, password, (err, sessionId) => {
    if (err) {
      res.sendStatus(500);
      global.log.error(err);
      return;
    }

    if (sessionId) res.json({ sessionId });
    else res.sendStatus(401);
  });
});

login.post('/logout', (req, res) => {
  console.log('logout');
  const sessionId = req.body.sessionId;
  dbApi.clearSession(sessionId, (err) => {
    if (err) {
      res.sendStatus(500);
      global.log.error(err);
    } else {
      res.sendStatus(200);
    }
  });
});

module.exports = login;
