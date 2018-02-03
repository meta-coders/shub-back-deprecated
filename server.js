'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const login = require('./modules/login.js');
const api = require('.modules/api.js');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/login', login);
app.use('/api', api);

app.listen(80, '0.0.0.0');



// ssh root@207.154.253.221
