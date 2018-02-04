'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const dbApi = require('../lib/dbApi.js');
const csv = require('../lib/CSVreciever.js');

const admin = express();

admin.use(fileUpload());
admin.use(bodyParser.json());
admin.use(bodyParser.urlencoded({
  extended: true
}));

admin.use('/uploadSchedule', (req, res, next) => {
  const sessionId = req.body.sessionId;
  dbApi.checkSession(sessionId, (err, userId) => {
    if (userId) next();
    else res.sendStatus(401);
  });
});

admin.use('/uploadTimetable', (req, res, next) => {
  const sessionId = req.body.sessionId;
  dbApi.checkSession(sessionId, (err, userId) => {
    if (userId) next();
    else res.sendStatus(401);
  });
});


admin.post('/uploadSchedule', (req, res) => {
  const file = req.files.table;
  const className = req.body.className;
  csv.insertSchedule(className, file.data);
  res.sendStatus(200);
});

admin.post('/uploadTimetable', (req, res) => {
  const file = req.files.table;
  csv.insertTimetable(file.data);
  res.sendStatus(200);
});


module.exports = admin;
