'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const dbApi = require('../lib/dbApi.js');
const api = express();

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
  extended: true
}));

dbApi.init();
api.get('/:fn', (req, res) => res.send(req.params.fn));

api.post('/:fn', (req, res) => {
  const fn = req.params.fn;
  const body = req.body;
  dbApi[fn](body, (err, data) => {
    if (err) {
      res.sendStatus(500);
      global.log.error(err);
    } else if (!data) {
      res.sendStatus(401);
    } else {
      res.json(data);
    }
  });
});

module.exports = api;
