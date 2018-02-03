'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const dbApi = require('./lib/dbApi.js');
const sessions = require('./sessions.js');
const api = express();

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
  extended: true
}));

dbApi.init();


api.use('/:fn', (req, res, next) => {
  const sessionId = req.body.sessionId;
  if (sessions.has(sessionId)) next();
});

api.post('/:fn', (req, res) => {
  const fn = req.params.fn;
  const body = req.body;
  dbApi.do()[fn](body, (err, data) => {
    res.json(data);
  });
});


module.exports = api;
