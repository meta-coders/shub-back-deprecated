'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const api = require('.modules/api.js');
const login = require('./modules/login.js');

const app = express();

app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', login);
app.use('/api', api);

app.listen(80, '0.0.0.0');
