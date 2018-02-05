'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const api = require('./modules/api.js');
const login = require('./modules/login.js');
const admin = require('./modules/admin.js');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static('static'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/auth', login);
app.use('/api', api);
app.use('/admin', admin);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

app.get('/teachers', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

app.get('/homework', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

app.get('/stuff', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
})

app.listen(80, '0.0.0.0');
